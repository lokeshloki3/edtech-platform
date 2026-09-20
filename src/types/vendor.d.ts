// Ambient declarations for dependencies that ship no types.

declare module 'react-super-responsive-table' {
  import type { ComponentType, TableHTMLAttributes, HTMLAttributes } from 'react';

  export const Table: ComponentType<TableHTMLAttributes<HTMLTableElement>>;
  export const Thead: ComponentType<HTMLAttributes<HTMLTableSectionElement>>;
  export const Tbody: ComponentType<HTMLAttributes<HTMLTableSectionElement>>;
  export const Tr: ComponentType<HTMLAttributes<HTMLTableRowElement>>;
  export const Th: ComponentType<HTMLAttributes<HTMLTableCellElement>>;
  export const Td: ComponentType<HTMLAttributes<HTMLTableCellElement>>;
}

declare module 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

declare module 'react-rating-stars-component' {
  import type { ComponentType } from 'react';

  interface ReactStarsProps {
    count?: number;
    value?: number;
    size?: number;
    edit?: boolean;
    isHalf?: boolean;
    activeColor?: string;
    color?: string;
    onChange?: (newRating: number) => void;
    emptyIcon?: React.ReactElement;
    halfIcon?: React.ReactElement;
    fullIcon?: React.ReactElement;
  }

  const ReactStars: ComponentType<ReactStarsProps>;
  export default ReactStars;
}
