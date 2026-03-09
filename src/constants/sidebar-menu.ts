// sidebar-menu.ts
import {
  Home,
  CreditCard,
  Boxes,
  Gamepad2,
  Wallet,
  GalleryHorizontal,
  Images,
  ListOrdered,
  Notebook,
  LucideWalletCards,
  Lock,
} from "lucide-react";
import {
  MdOutlineCategory,
  MdCorporateFare,
  MdFormatListBulleted,
} from "react-icons/md";
import { HiCash } from "react-icons/hi";

import { TbCategoryPlus } from "react-icons/tb";

export type SidebarMenu = {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: SidebarMenu[];
};

export type SidebarSection = {
  title?: string;
  menus: SidebarMenu[];
};

export const sidebarMenus: SidebarSection[] = [
  {
    menus: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/",
      },
      {
        label: "Transactions",
        icon: Wallet,
        children: [
          { label: "Overview", path: "/transactions", icon: Wallet },
          { label: "Spending", path: "/spending", icon: HiCash },
          { label: "Order", path: "/orders", icon: ListOrdered },
        ],
      },
      {
        label: "CMS",
        icon: GalleryHorizontal,
        children: [
          { label: "Banners", path: "/banners", icon: GalleryHorizontal },
          { label: "Shows", path: "/shows", icon: Images },
          { label: "Articles", path: "/blog", icon: Notebook },
        ],
      },
    ],
  },
  {
    title: "Master Data",
    menus: [
      {
        label: "Inventory",
        icon: Boxes,
        children: [
          { label: "Games", icon: Gamepad2, path: "/games" },
          { label: "Products", icon: Boxes, path: "/products" },
          {
            label: "Category Product",
            icon: TbCategoryPlus,
            path: "/category-product",
          },
          { label: "Category", icon: MdOutlineCategory, path: "/categories" },
          { label: "Input Fields", icon: MdFormatListBulleted, path: "/input" },
        ],
      },
      {
        label: "Payments",
        icon: CreditCard,
        children: [
          { label: "Methods", icon: CreditCard, path: "/payment-methods" },
          {
            label: "Categories",
            icon: LucideWalletCards,
            path: "/payment-methods-categories",
          },
        ],
      },
      {
        label: "Providers",
        icon: MdCorporateFare,
        path: "/provider",
      },

      {
        label: "Security",
        icon: Lock,
        children: [
          {
            label: "2FA",
            icon: Lock,
            path: "/2fa-setup",
          },
        ],
      },
    ],
  },
];
