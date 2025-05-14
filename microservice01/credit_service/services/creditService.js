const InstitutionCredit = require('../models/institutionCredit');
const { PaymentTransaction, PaymentStatus } = require('../models/paymentTransaction');
const CreditUsageLog = require('../models/creditUsageLog');

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
      
      // This is dummy logic for payment processing
      let paymentDetails = {
        amount: creditsToAdd * 10, 
        externalTransactionId: `txn_${Date.now()}`
      };
      console.log('Payment details:', paymentDetails);
      // Create payment transaction if payment details are provided
      if (paymentDetails) {
        const transaction = new PaymentTransaction({
          institutionId,
          numOfCredits: creditsToAdd,
          amount: paymentDetails.amount,
          externalTransactionId: paymentDetails.externalTransactionId,
          status: PaymentStatus.COMPLETED
        });
        
        await transaction.save();
      }
      
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
  async processPayment(institutionId, numOfCredits, paymentDetails) {
    try {
      // Create payment transaction
      const transaction = new PaymentTransaction({
        institutionId,
        numOfCredits,
        amount: paymentDetails.amount,
        externalTransactionId: paymentDetails.externalTransactionId,
        status: PaymentStatus.PENDING
      });
      
      await transaction.save();
      
      // In a real implementation, you would integrate with payment gateway here
      // For now, we're simulating a successful payment
      
      // Update transaction status
      transaction.status = PaymentStatus.COMPLETED;
      await transaction.save();
      
      // Add credits to institution
      const result = await this.addCredits(institutionId, numOfCredits, {
        amount: paymentDetails.amount,
        externalTransactionId: paymentDetails.externalTransactionId
      });
      
      return {
        transactionId: transaction._id,
        institutionId,
        numOfCredits,
        status: transaction.status,
        creditBalance: result
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}

module.exports = new CreditService();