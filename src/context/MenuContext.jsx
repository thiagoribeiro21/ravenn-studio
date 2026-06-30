import { createContext, useContext, useRef, useState } from 'react';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef      = useRef(null);

  const toggleMenu = () => setIsOpen((v) => !v);
  const closeMenu  = () => setIsOpen(false);

  return (
    <MenuContext.Provider
      value={{ isOpen, toggleMenu, closeMenu, scrolled, setScrolled, scrollContainerRef }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be inside <MenuProvider>');
  return ctx;
}
