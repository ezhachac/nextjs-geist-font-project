import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum CategoryType {
  INGRESO = 'ingreso',
  GASTO = 'gasto'
}

interface CategoryAttributes {
  id: number;
  name: string;
  type: CategoryType;
  color: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public type!: CategoryType;
  public color!: string;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(CategoryType)),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  }
);

export default Category;
