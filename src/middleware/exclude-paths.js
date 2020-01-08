//takes array of objects indicating path-method combinatons to exclude
//objects should have key 'path' with the path and key 'method' with a HTTP method or '*'

const excludePaths = (paths, middleware) => {
  return (req, res, next) => {
    let excluded = false;
    for (let path of paths) {
      if (path.path === req.path) {
        if (path.method === '*' || path.method === req.method) {
          excluded = true;
        }
      }
    }
    if (excluded) {
      return next();
    }
    return middleware(req, res, next);
  };
};

module.exports = { excludePaths };
