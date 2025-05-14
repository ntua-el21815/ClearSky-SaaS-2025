const express = require('express');
const router = express.Router();
const creditService = require('../services/creditService');

// Get credit balance for an institution
router.get('/institution/:institutionId/balance', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const balance = await creditService.getInstitutionCreditBalance(institutionId);
    res.status(200).json(balance);
  } catch (error) {
    console.error('Error getting credit balance:', error);
    res.status(500).json({ message: 'Failed to get credit balance', error: error.message });
  }
});

// Add credits to an institution
router.post('/institution/:institutionId/add', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { credits } = req.body;
    
    if (!credits || credits <= 0) {
      return res.status(400).json({ message: 'Invalid credit amount' });
    }
    
    const result = await creditService.addCredits(institutionId, credits);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ message: 'Failed to add credits', error: error.message });
  }
});

// Use credits for an institution
router.post('/institution/:institutionId/use', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { credits, operation, courseId } = req.body;
    
    if (!credits || credits <= 0) {
      return res.status(400).json({ message: 'Invalid credit amount' });
    }
    
    if (!operation) {
      return res.status(400).json({ message: 'Operation is required' });
    }
    
    const result = await creditService.useCredits(institutionId, credits, operation, courseId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error using credits:', error);
    
    if (error.message === 'Insufficient credits') {
      return res.status(400).json({ message: 'Insufficient credits' });
    }
    
    res.status(500).json({ message: 'Failed to use credits', error: error.message });
  }
});

// Get credit usage history for an institution
router.get('/institution/:institutionId/usage', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const history = await creditService.getCreditUsageHistory(institutionId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting credit usage history:', error);
    res.status(500).json({ message: 'Failed to get usage history', error: error.message });
  }
});

// Process payment and add credits
router.post('/payment/process', async (req, res) => {
  try {
    const { institutionId, numOfCredits, paymentDetails } = req.body;
    
    if (!institutionId || !numOfCredits || numOfCredits <= 0 || !paymentDetails) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    
    const result = await creditService.processPayment(institutionId, numOfCredits, paymentDetails);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
});

module.exports = router;