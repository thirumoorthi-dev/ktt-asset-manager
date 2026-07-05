const validateSchema = (schema, renderView, getExtraDataFn) => {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err) {
      let firstError = 'Validation failed';
      if (err.inner && err.inner.length > 0) {
        firstError = err.inner[0].message;
      } else if (err.message) {
        firstError = err.message;
      }
      
      let extraData = {};
      if (getExtraDataFn) {
        try {
          extraData = await getExtraDataFn(req, res);
        } catch (fetchErr) {
          console.error(fetchErr);
        }
      }
      
      res.render(renderView, {
        ...extraData,
        error: firstError,
        title: extraData.title || 'Form'
      });
    }
  };
};

module.exports = {
  validateSchema
};
