/**
 * Category Utilities
 * Helper functions for category management operations
 */
import { Category } from "@/types/index.d";

/**
 * Count all subcategories recursively
 * @param category - Category to count subcategories for
 * @returns Total number of subcategories at all levels
 */
export function countAllSubcategories(category: Category): number {
  if (!category.subcategories || category.subcategories.length === 0) {
    return 0;
  }
  
  let count = category.subcategories.length;
  category.subcategories.forEach((sub) => {
    count += countAllSubcategories(sub);
  });
  
  return count;
}

/**
 * Find a category by ID in a tree structure
 * @param categories - Array of categories to search
 * @param targetId - ID of the category to find
 * @returns Category if found, null otherwise
 */
export function findCategoryById(
  categories: Category[],
  targetId: string
): Category | null {
  for (const cat of categories) {
    if (cat._id === targetId) return cat;
    if (cat.subcategories) {
      const found = findCategoryById(cat.subcategories, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all IDs of a category and its subcategories
 * @param category - Category to get IDs from
 * @returns Array of all category IDs including subcategories
 */
export function getAllCategoryIds(category: Category): string[] {
  const ids: string[] = [category._id];
  
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach((sub) => {
      ids.push(...getAllCategoryIds(sub));
    });
  }
  
  return ids;
}

/**
 * Get the full path of a category
 * @param categories - All categories tree
 * @param targetId - ID of the target category
 * @returns Array of category names from root to target
 */
export function getCategoryPath(
  categories: Category[],
  targetId: string
): string[] {
  const findPath = (
    cats: Category[],
    target: string,
    path: string[] = []
  ): string[] | null => {
    for (const cat of cats) {
      if (cat._id === target) {
        return [...path, cat.name];
      }
      if (cat.subcategories) {
        const result = findPath(cat.subcategories, target, [...path, cat.name]);
        if (result) return result;
      }
    }
    return null;
  };

  return findPath(categories, targetId) || [];
}

/**
 * Build a list of all category names that will be deleted
 * @param category - Category to be deleted
 * @returns Array of category names
 */
export function getAllCategoryNames(category: Category): string[] {
  const names: string[] = [category.name];
  
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach((sub) => {
      names.push(...getAllCategoryNames(sub));
    });
  }
  
  return names;
}

/**
 * Flatten a category tree into a list
 * @param categories - Array of categories
 * @param level - Current depth level (default: 0)
 * @returns Flattened array with level information
 */
export function flattenCategories(
  categories: Category[],
  level = 0
): Array<Category & { level: number }> {
  let result: Array<Category & { level: number }> = [];
  
  for (const cat of categories) {
    result.push({ ...cat, level });
    
    if (cat.subcategories && cat.subcategories.length > 0) {
      result = result.concat(flattenCategories(cat.subcategories, level + 1));
    }
  }
  
  return result;
}

/**
 * Check if a category has any subcategories
 * @param category - Category to check
 * @returns True if category has subcategories
 */
export function hasSubcategories(category: Category): boolean {
  return !!(category.subcategories && category.subcategories.length > 0);
}

/**
 * Get the depth of a category tree
 * @param category - Root category
 * @returns Maximum depth of the tree
 */
export function getCategoryTreeDepth(category: Category): number {
  if (!category.subcategories || category.subcategories.length === 0) {
    return 1;
  }
  
  const depths = category.subcategories.map((sub) => getCategoryTreeDepth(sub));
  return 1 + Math.max(...depths);
}

/**
 * Validate category deletion
 * @param category - Category to delete
 * @param products - Optional array of products to check
 * @returns Validation result with message
 */
export function validateCategoryDeletion(
  category: Category,
  products?: Array<{ category: string | Category }>
): { canDelete: boolean; reason?: string; affectedCount?: number } {
  // Check if category has subcategories
  const subCount = countAllSubcategories(category);
  
  // Check if any products are assigned (if products array is provided)
  if (products) {
    const affectedProducts = products.filter((p) => {
      const catId = typeof p.category === "string" ? p.category : p.category._id;
      const allIds = getAllCategoryIds(category);
      return allIds.includes(catId);
    });
    
    if (affectedProducts.length > 0) {
      return {
        canDelete: false,
        reason: `Cannot delete: ${affectedProducts.length} product(s) are assigned to this category or its subcategories`,
        affectedCount: affectedProducts.length,
      };
    }
  }
  
  return {
    canDelete: true,
    affectedCount: subCount,
  };
}

/**
 * Format category deletion summary
 * @param category - Category to be deleted
 * @returns Human-readable summary
 */
export function formatDeletionSummary(category: Category): string {
  const subCount = countAllSubcategories(category);
  
  if (subCount === 0) {
    return `Delete "${category.name}"`;
  } else if (subCount === 1) {
    return `Delete "${category.name}" and 1 subcategory`;
  } else {
    return `Delete "${category.name}" and ${subCount} subcategories`;
  }
}

/**
 * Get parent category name
 * @param categories - All categories (flat list)
 * @param parentId - ID of parent category
 * @returns Parent category name or null
 */
export function getParentCategoryName(
  categories: Category[],
  parentId: string | null | undefined
): string | null {
  if (!parentId) return null;
  const parent = categories.find((c) => c._id === parentId);
  return parent ? parent.name : null;
}
