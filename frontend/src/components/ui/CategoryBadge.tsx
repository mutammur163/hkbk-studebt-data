import { motion } from 'framer-motion';
import type { Category } from '../../types';
import { getCategoryColor } from '../../utils/helpers';

interface CategoryBadgeProps {
  category: Category;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}
    >
      {category}
    </motion.span>
  );
}
