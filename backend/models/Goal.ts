import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum GoalStatus {
  ACTIVA = 'activa',
  COMPLETADA = 'completada',
  PAUSADA = 'pausada',
  CANCELADA = 'cancelada'
}

interface GoalAttributes {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: Date;
  status: GoalStatus;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface GoalCreationAttributes extends Optional<GoalAttributes, 'id' | 'current_amount' | 'status' | 'description' | 'created_at' | 'updated_at'> {}

class Goal extends Model<GoalAttributes, GoalCreationAttributes> implements GoalAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public target_amount!: number;
  public current_amount!: number;
  public target_date!: Date;
  public status!: GoalStatus;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Método para calcular el progreso
  public getProgress(): number {
    return this.target_amount > 0 ? (this.current_amount / this.target_amount) * 100 : 0;
  }

  // Método para verificar si la meta está completada
  public isCompleted(): boolean {
    return this.current_amount >= this.target_amount;
  }
}

Goal.init(
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
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    target_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    current_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    target_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(GoalStatus)),
      allowNull: false,
      defaultValue: GoalStatus.ACTIVA,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Goal',
    tableName: 'goals',
    timestamps: true,
    underscored: true,
  }
);

export default Goal;
