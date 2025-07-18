import { Category } from '../models';
import { CategoryType } from '../models/Category';

// Categorías predeterminadas para gastos
const expenseCategories = [
  { name: 'Alimentación', color: '#EF4444', type: CategoryType.GASTO },
  { name: 'Transporte', color: '#F97316', type: CategoryType.GASTO },
  { name: 'Vivienda', color: '#EAB308', type: CategoryType.GASTO },
  { name: 'Servicios', color: '#84CC16', type: CategoryType.GASTO },
  { name: 'Salud', color: '#06B6D4', type: CategoryType.GASTO },
  { name: 'Educación', color: '#3B82F6', type: CategoryType.GASTO },
  { name: 'Entretenimiento', color: '#8B5CF6', type: CategoryType.GASTO },
  { name: 'Ropa', color: '#EC4899', type: CategoryType.GASTO },
  { name: 'Créditos', color: '#DC2626', type: CategoryType.GASTO },
  { name: 'Otros Gastos', color: '#6B7280', type: CategoryType.GASTO }
];

// Categorías predeterminadas para ingresos
const incomeCategories = [
  { name: 'Salario', color: '#10B981', type: CategoryType.INGRESO },
  { name: 'Freelance', color: '#059669', type: CategoryType.INGRESO },
  { name: 'Inversiones', color: '#047857', type: CategoryType.INGRESO },
  { name: 'Bonos', color: '#065F46', type: CategoryType.INGRESO },
  { name: 'Ventas', color: '#34D399', type: CategoryType.INGRESO },
  { name: 'Otros Ingresos', color: '#6EE7B7', type: CategoryType.INGRESO }
];

export const seedCategories = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando seed de categorías...');

    // Verificar si ya existen categorías
    const existingCategories = await Category.findAll();
    
    if (existingCategories.length > 0) {
      console.log('✅ Las categorías ya existen, omitiendo seed');
      return;
    }

    // Crear categorías de gastos
    for (const category of expenseCategories) {
      await Category.create(category);
    }

    // Crear categorías de ingresos
    for (const category of incomeCategories) {
      await Category.create(category);
    }

    console.log('✅ Categorías creadas exitosamente');
    console.log(`📊 Total categorías de gastos: ${expenseCategories.length}`);
    console.log(`💰 Total categorías de ingresos: ${incomeCategories.length}`);
    
  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
    throw error;
  }
};

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('🎉 Seed completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en seed:', error);
      process.exit(1);
    });
}
