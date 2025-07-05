
import { Search, Plus, Home, Users, Shield, Building2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  onAddPackage: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  title?: string;
  addButtonText?: string;
}

export function Header({ 
  onAddPackage, 
  searchTerm, 
  onSearchChange, 
  title = "Encomendas",
  addButtonText = "Nova Encomenda"
}: HeaderProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Encomendas" },
    { path: "/residents", icon: Users, label: "Moradores" },
    { path: "/doormen", icon: Shield, label: "Porteiros" },
    { path: "/properties", icon: Building2, label: "Imóveis" },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Sistema de Gestão do Condomínio</p>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop add button */}
          <Button onClick={onAddPackage} className="bg-blue-600 hover:bg-blue-700 hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden mt-4 space-y-2`}>
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-2 border-t">
            <Button onClick={onAddPackage} className="bg-blue-600 hover:bg-blue-700 w-full">
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          </div>
        </div>

        {/* Desktop navigation and search */}
        <div className={`${isMobileMenuOpen ? 'hidden' : 'flex'} sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 sm:mt-0`}>
          <nav className="hidden sm:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
