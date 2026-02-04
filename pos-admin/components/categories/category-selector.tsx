import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Category } from "@/types/index.d";

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  showFullPath?: boolean;
}

interface CategoryTreeSelectItemProps {
  category: Category;
  level: number;
  selectedId: string;
  onSelect: (categoryId: string) => void;
  expandedIds: Set<string>;
  toggleExpand: (categoryId: string) => void;
}

function CategoryTreeSelectItem({
  category,
  level,
  selectedId,
  onSelect,
  expandedIds,
  toggleExpand,
}: CategoryTreeSelectItemProps) {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const isExpanded = expandedIds.has(category._id);
  const isSelected = selectedId === category._id;

  return (
    <div className="relative">
      {/* Left border for nested items */}
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
          style={{ left: `${(level - 1) * 20 + 12}px` }}
        />
      )}
      
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors relative ${
          isSelected 
            ? "bg-blue-500 text-white font-medium hover:bg-blue-600" 
            : "text-gray-700 hover:bg-blue-50"
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelect(category._id)}
      >
        {/* Expand/Collapse Button */}
        {hasSubcategories ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(category._id);
            }}
            className={`p-0.5 rounded transition-colors ${
              isSelected ? "hover:bg-blue-600" : "hover:bg-gray-200"
            }`}
          >
            {isExpanded ? (
              <ChevronDown size={14} className={isSelected ? "text-white" : "text-gray-600"} />
            ) : (
              <ChevronRight size={14} className={isSelected ? "text-white" : "text-gray-600"} />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Folder Icon */}
        {hasSubcategories ? (
          isExpanded ? (
            <FolderOpen size={16} className={isSelected ? "text-blue-100" : "text-yellow-600"} />
          ) : (
            <Folder size={16} className={isSelected ? "text-blue-100" : "text-yellow-600"} />
          )
        ) : (
          <Folder size={16} className={isSelected ? "text-blue-100" : "text-gray-400"} />
        )}

        {/* Category Name */}
        <span className="text-sm flex-1">{category.name}</span>

        {/* Subcategory Count Badge */}
        {hasSubcategories && (
          <span className={`text-xs px-2 py-0.5 rounded ${
            isSelected 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-600"
          }`}>
            {category.subcategories!.length}
          </span>
        )}
      </div>

      {/* Subcategories */}
      {hasSubcategories && isExpanded && (
        <div>
          {category.subcategories!.map((subcategory) => (
            <CategoryTreeSelectItem
              key={subcategory._id}
              category={subcategory}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hierarchical Category Selector Component
 * 
 * Displays categories in a tree structure with expand/collapse functionality
 */
export function CategorySelector({
  value,
  onChange,
  categories,
  placeholder = "Select a category",
  label,
  required = false,
  showFullPath = false,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Auto-expand parent categories when selector opens
  useEffect(() => {
    if (isOpen && categories.length > 0) {
      const newExpanded = new Set<string>();
      // Expand only top-level categories initially
      categories.forEach(cat => {
        if (cat.subcategories && cat.subcategories.length > 0) {
          newExpanded.add(cat._id);
        }
      });
      setExpandedIds(newExpanded);
    }
  }, [isOpen, categories]);

  // Find and set the selected category
  useEffect(() => {
    if (value) {
      const findCategory = (cats: Category[]): Category | null => {
        for (const cat of cats) {
          if (cat._id === value) return cat;
          if (cat.subcategories) {
            const found = findCategory(cat.subcategories);
            if (found) return found;
          }
        }
        return null;
      };
      setSelectedCategory(findCategory(categories));
    } else {
      setSelectedCategory(null);
    }
  }, [value, categories]);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedIds(newExpanded);
  };

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedCategory) return placeholder;
    if (showFullPath) {
      // Build path from parent to child
      const buildPath = (cat: Category, path: string[] = []): string[] => {
        path.unshift(cat.name);
        if (cat.parent && typeof cat.parent === "object") {
          return buildPath(cat.parent, path);
        }
        return path;
      };
      return buildPath(selectedCategory).join(" > ");
    }
    return selectedCategory.name;
  };

  // Build breadcrumb path for display
  const getSelectedPath = () => {
    if (!selectedCategory) return null;
    
    const buildPath = (cat: Category, categories: Category[]): string[] => {
      const path: string[] = [cat.name];
      
      // Try to find parent
      const findParent = (cats: Category[], childId: string): Category | null => {
        for (const c of cats) {
          if (c.subcategories?.some(sub => sub._id === childId)) {
            return c;
          }
          if (c.subcategories) {
            const found = findParent(c.subcategories, childId);
            if (found) return found;
          }
        }
        return null;
      };

      let currentCat: Category | null = cat;
      while (currentCat && typeof currentCat.parent === 'string') {
        const parent = findParent(categories, currentCat._id);
        if (parent) {
          path.unshift(parent.name);
          currentCat = parent;
        } else {
          break;
        }
      }

      return path;
    };

    return buildPath(selectedCategory, categories);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between transition-all ${
          isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300 hover:border-gray-400"
        } ${!selectedCategory ? "text-gray-400" : "text-gray-900"}`}
      >
        <div className="flex-1 truncate">
          {selectedCategory ? (
            showFullPath ? (
              <div className="flex items-center gap-1 text-sm">
                {getSelectedPath()?.map((name, index, arr) => (
                  <React.Fragment key={index}>
                    <span className={index === arr.length - 1 ? "font-medium" : "text-gray-500"}>
                      {name}
                    </span>
                    {index < arr.length - 1 && (
                      <ChevronRight size={14} className="text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className="text-sm">{selectedCategory.name}</span>
            )
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`ml-2 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
            {/* Helper Text */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span>💡</span>
                <span>Click <ChevronRight size={12} className="inline" /> to expand, select any category level</span>
              </div>
            </div>

            {/* Categories List */}
            <div className="overflow-y-auto">
              {categories.length === 0 ? (
                <div className="px-3 py-8 text-sm text-gray-500 text-center">
                  <Folder size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No categories available</p>
                  <p className="text-xs mt-1">Create categories first</p>
                </div>
              ) : (
                <div className="py-1">
                  {categories.map((category) => (
                    <CategoryTreeSelectItem
                      key={category._id}
                      category={category}
                      level={0}
                      selectedId={value}
                      onSelect={handleSelect}
                      expandedIds={expandedIds}
                      toggleExpand={toggleExpand}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Flat Category Selector (Simple Dropdown)
 * Shows all categories in a flat list with indentation
 */
export function FlatCategorySelector({
  value,
  onChange,
  categories,
  placeholder = "Select a category",
  label,
  required = false,
}: Omit<CategorySelectorProps, 'showFullPath'>) {
  const flattenCategories = (cats: Category[], level = 0): Array<Category & { level: number }> => {
    let result: Array<Category & { level: number }> = [];
    for (const cat of cats) {
      result.push({ ...cat, level });
      if (cat.subcategories && cat.subcategories.length > 0) {
        result = result.concat(flattenCategories(cat.subcategories, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        <option value="">{placeholder}</option>
        {flatCategories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {"\u00A0".repeat(cat.level * 4)}
            {cat.level > 0 ? "└─ " : ""}
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
