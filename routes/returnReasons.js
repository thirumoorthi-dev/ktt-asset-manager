const express = require('express');
const router = express.Router();
const returnReasonController = require('../controllers/returnReasonController');
const { validateSchema } = require('../middleware/validation');
const { returnReasonSchema } = require('../schemas');
const { ReturnReason } = require('../models');

const getReturnReasonsExtraData = async () => {
  const reasons = await ReturnReason.findAll({ order: [['CreatedDate', 'ASC']] });
  return { reasons, title: 'Return Reason Master', editReason: null };
};

const getEditReturnReasonExtraData = async (req) => {
  const reasons = await ReturnReason.findAll({ order: [['CreatedDate', 'ASC']] });
  const editReason = await ReturnReason.findByPk(req.params.id);
  return { reasons, title: 'Return Reason Master', editReason };
};

router.get('/', returnReasonController.getReturnReasons);
router.post('/create', validateSchema(returnReasonSchema, 'return-reasons/index', getReturnReasonsExtraData), returnReasonController.postCreateReturnReason);
router.post('/edit/:id', validateSchema(returnReasonSchema, 'return-reasons/index', getEditReturnReasonExtraData), returnReasonController.postEditReturnReason);

module.exports = router;
