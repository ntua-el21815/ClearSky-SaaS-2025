const InstitutionCredit = require('../models/institutionCredit');
const { PaymentTransaction, PaymentStatus } = require('../models/paymentTransaction');
const CreditUsageLog = require('../models/creditUsageLog');
const e = require('express');
const stripe = require('stripe')('sk_test_K4dDnnwpTYqthU0VnbqULyZ000I8mYOPJY');

class CreditService {
  // Get credit balance for an institution
  async getInstitutionCreditBalance(institutionId) {
    try {
      const credit = await InstitutionCredit.findOne({ institutionId });
      
      if (!credit) {
        return {
          institutionId,
          totalCredits: 0,
          usedCredits: 0,
          availableCredits: 0
        };
      }
      
      return {
        institutionId: credit.institutionId,
        totalCredits: credit.totalCredits,
        usedCredits: credit.usedCredits,
        availableCredits: credit.totalCredits - credit.usedCredits
      };
    } catch (error) {
      console.error('Error getting credit balance:', error);
      throw error;
    }
  }

  // Add credits to an institution
  async addCredits(institutionId, creditsToAdd) {
    try {
      // Find or create institution credit record
      let creditRecord = await InstitutionCredit.findOne({ institutionId });
      
      if (!creditRecord) {
        creditRecord = new InstitutionCredit({
          institutionId,
          totalCredits: creditsToAdd,
          usedCredits: 0
        });
      } else {
        creditRecord.totalCredits += creditsToAdd;
        creditRecord.lastUpdated = new Date();
      }
      
      await creditRecord.save();
      
      return {
        institutionId: creditRecord.institutionId,
        totalCredits: creditRecord.totalCredits,
        usedCredits: creditRecord.usedCredits,
        availableCredits: creditRecord.totalCredits - creditRecord.usedCredits,
        creditsAdded: creditsToAdd
      };
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  // Use credits for an institution
  async useCredits(institutionId, creditsToUse, operation, courseId = null) {
    try {
      // Find institution credit record
      const creditRecord = await InstitutionCredit.findOne({ institutionId });
      
      if (!creditRecord) {
        throw new Error('No credits found for institution');
      }
      
      // Check if institution has enough credits
      const availableCredits = creditRecord.totalCredits - creditRecord.usedCredits;
      
      if (availableCredits < creditsToUse) {
        throw new Error('Insufficient credits');
      }
      
      // Update credit record
      creditRecord.usedCredits += creditsToUse;
      creditRecord.lastUpdated = new Date();
      
      await creditRecord.save();
      
      // Log credit usage
      const usageLog = new CreditUsageLog({
        institutionId,
        creditsUsed: creditsToUse,
        operation,
        courseId
      });
      
      await usageLog.save();
      
      return {
        institutionId: creditRecord.institutionId,
        totalCredits: creditRecord.totalCredits,
        usedCredits: creditRecord.usedCredits,
        availableCredits: creditRecord.totalCredits - creditRecord.usedCredits,
        creditsUsed: creditsToUse
      };
    } catch (error) {
      console.error('Error using credits:', error);
      throw error;
    }
  }

  // Get credit usage history for an institution
  async getCreditUsageHistory(institutionId) {
    try {
      const usageLogs = await CreditUsageLog.find({ institutionId })
        .sort({ usedAt: -1 });
      
      return usageLogs;
    } catch (error) {
      console.error('Error getting credit usage history:', error);
      throw error;
    }
  }

  // Process payment and add credits
  async processPayment(institutionId, numOfCredits, paymentDetails = null) {
    try {
      // Dummy payment details for testing
      let paymentDetails = {
        amount: numOfCredits * 1000, // Amount in cents
        currency: 'eur',
        externalTransactionId: `tx_${Date.now()}`,
        status: PaymentStatus.PENDING
      }
      const transaction = new PaymentTransaction({
        institutionId,
        numOfCredits,
        amount: paymentDetails.amount,
        externalTransactionId: paymentDetails.externalTransactionId,
        status: PaymentStatus.PENDING
      });
      
      await transaction.save();
      // List of test Stripe payment method IDs
      const testCards = [
        'pm_card_visa',
        'pm_card_mastercard',
        'pm_card_amex',
        'pm_card_discover',
        'pm_card_jcb',
        'pm_card_diners',
        'pm_card_visa_chargeDeclined',
        'pm_card_visa_chargeDeclinedInsufficientFunds',
        'pm_card_visa_chargeDeclinedLostCard',
        'pm_card_visa_chargeDeclinedStolenCard',
        'pm_card_chargeDeclinedExpiredCard',
        'pm_card_chargeDeclinedIncorrectCvc',
        'pm_card_chargeDeclinedProcessingError',
        'pm_card_visa_chargeDeclinedVelocityLimitExceeded'
      ];

      // Simulating Errors and Successes in payment
      // Choose a random card, but 1 out of 10 times pick a failing card
      let selectedCard;
      if (Math.random() < 0.3) {
        // Pick a known failing card from the testCards list
        const failingCards = [
          'pm_card_visa_chargeDeclined',
          'pm_card_visa_chargeDeclinedInsufficientFunds',
          'pm_card_visa_chargeDeclinedLostCard',
          'pm_card_visa_chargeDeclinedStolenCard',
          'pm_card_chargeDeclinedExpiredCard',
          'pm_card_chargeDeclinedIncorrectCvc',
          'pm_card_chargeDeclinedProcessingError',
          'pm_card_visa_chargeDeclinedVelocityLimitExceeded'
        ];
        selectedCard = failingCards[Math.floor(Math.random() * failingCards.length)];
      } else {
        // Pick a successful card
        const successCards = [
          'pm_card_visa',
          'pm_card_mastercard',
          'pm_card_amex',
          'pm_card_discover',
          'pm_card_jcb',
          'pm_card_diners'
        ];
        selectedCard = successCards[Math.floor(Math.random() * successCards.length)];
      }
      let paymentIntent;
      let reasonForDecline = null;
      try{
          paymentIntent = await stripe.paymentIntents.create({
          amount: paymentDetails.amount, // amount in cents
          currency: 'eur',
          payment_method: selectedCard,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          }
        });
      }
      catch (error) {
        console.error('Error while processing payment:', error);
        reasonForDecline = error.raw.message;
      }

      if (!paymentIntent) {
        transaction.status = PaymentStatus.FAILED;
        transaction.reasonForDecline = reasonForDecline || 'Payment failed';
        await transaction.save();

        const previousBalance = (await this.getInstitutionCreditBalance(institutionId));
        return {
          transactionId: transaction._id,
          institutionId,
          numOfCredits,
          status: transaction.status,
          creditBalance: previousBalance.availableCredits,
          reasonForDecline: transaction.reasonForDecline
        };
      }
      // Update transaction status based on payment outcome
      if (paymentIntent.status === 'succeeded') {
        transaction.status = PaymentStatus.COMPLETED;
      } else {
        transaction.status = PaymentStatus.FAILED;
        transaction.reasonForDecline = paymentIntent.last_payment_error?.message || 'Payment failed';
      }
      await transaction.save();

      // Add credits to institution if payment succeeded
      // Get previous balance before adding credits
      const previousBalance = (await this.getInstitutionCreditBalance(institutionId));
      let result = previousBalance.availableCredits;
      if (transaction.status === PaymentStatus.COMPLETED) {
        result = (await this.addCredits(institutionId, numOfCredits)).availableCredits;
      }
      
      return {
        transactionId: transaction._id,
        institutionId,
        numOfCredits,
        status: transaction.status,
        creditBalance: result,
        reasonForDecline: transaction.reasonForDecline
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}

module.exports = new CreditService();