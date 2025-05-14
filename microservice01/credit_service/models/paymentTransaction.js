const mongoose = require('mongoose');
const { Schema } = mongoose;

// Payment status enum equivalent
const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// Schema for Payment Transactions
const paymentTransactionSchema = new Schema({
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  numOfCredits: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  externalTransactionId: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  PaymentTransaction: mongoose.model('PaymentTransaction', paymentTransactionSchema),
  PaymentStatus
};