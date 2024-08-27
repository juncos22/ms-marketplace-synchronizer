import statusServer from './status.routes';
import userServer from './user.routes';
import categoryServer from './categories.routes';

export default {
  allRoutes: [statusServer, userServer, categoryServer],
};
