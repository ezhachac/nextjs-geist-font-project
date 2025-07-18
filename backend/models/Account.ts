import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum AccountType {
  BANCO = 'banco',
  EFECTIVO = 'efectivo',
  AHORROS = 'ahorros',
  TARJETA_CREDITO = 'tarjeta_credito',
  INVERSION = 'inversion'
}

interface AccountAttributes {
  id: number;
  user_id: number;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'id' | 'balance' | 'description' | 'created_at' | 'updated_at'> {}

class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public type!: AccountType;
  public balance!: number;
  public color!: string;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Account.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(AccountType)),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#3B82F6',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
  }
);

export default Account;
