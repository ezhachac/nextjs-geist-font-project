import sequelize from '../config/database';
import User from './User';
import Account from './Account';
import Category from './Category';
import Transaction from './Transaction';
import Goal from './Goal';

// Definir asociaciones entre modelos
const initializeAssociations = () => {
  // Un usuario puede tener múltiples cuentas
  User.hasMany(Account, {
    foreignKey: 'user_id',
    as: 'accounts'
  });
  Account.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Un usuario puede tener múltiples transacciones
  User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'transactions'
  });
  Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Una cuenta puede tener múltiples transacciones
  Account.hasMany(Transaction, {
    foreignKey: 'account_id',
    as: 'transactions'
  });
  Transaction.belongsTo(Account, {
    foreignKey: 'account_id',
    as: 'account'
  });

  // Una categoría puede tener múltiples transacciones
  Category.hasMany(Transaction, {
    foreignKey: 'category_id',
    as: 'transactions'
  });
  Transaction.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  // Un usuario puede tener múltiples metas
  User.hasMany(Goal, {
    foreignKey: 'user_id',
    as: 'goals'
  });
  Goal.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

// Inicializar asociaciones
initializeAssociations();

// Exportar modelos y sequelize
export {
  sequelize,
  User,
  Account,
  Category,
  Transaction,
  Goal
};

export default {
  sequelize,
  User,
  Account,
  Category,
  Transaction,
  Goal
};
