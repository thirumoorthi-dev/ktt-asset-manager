const { ReturnReason } = require('../models');

exports.getReturnReasons = async (req, res) => {
  try {
    const reasons = await ReturnReason.findAll({ order: [['CreatedDate', 'ASC']] });
    let editReason = null;
    if (req.query.edit) {
      editReason = await ReturnReason.findByPk(req.query.edit);
    }
    res.render('return-reasons/index', {
      title: 'Return Reason Master',
      reasons,
      editReason
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.postCreateReturnReason = async (req, res) => {
  try {
    const { ReasonName } = req.body;
    const userId = req.session.userId || null;
    await ReturnReason.create({
      ReasonName,
      CreatedBy: userId
    });
    res.redirect('/return-reasons');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.postEditReturnReason = async (req, res) => {
  try {
    const { id } = req.params;
    const { ReasonName, IsActive } = req.body;
    const userId = req.session.userId || null;
    await ReturnReason.update({
      ReasonName,
      IsActive: IsActive === 'true',
      UpdatedBy: userId,
      UpdatedDate: new Date()
    }, {
      where: { ReasonId: id }
    });
    res.redirect('/return-reasons');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
