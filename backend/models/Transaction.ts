import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum TransactionType {
  INGRESO = 'ingreso',
  GASTO = 'gasto',
  TRANSFERENCIA = 'transferencia'
}

interface TransactionAttributes {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public user_id!: number;
  public account_id!: number;
  public category_id!: number;
  public amount!: number;
  public type!: TransactionType;
  public description?: string;
  public date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
  }
);

export default Transaction;
