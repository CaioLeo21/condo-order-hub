
import { useState } from "react";
import { Package, Plus, Search, Menu, X, Home, Users, Shield, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onAddPackage?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  title?: string;
  addButtonText?: string;
}

export function Header({ 
  onAddPackage, 
  searchTerm = '', 
  onSearchChange, 
  title,
  addButtonText = "Nova Encomenda"
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, condominium, logout } = useAuth();
  const { canAccessDoormen } = usePermissions();

  const allNavigationItems = [
    { path: '/', label: 'Encomendas', icon: Home, visible: true },
    { path: '/residents', label: 'Moradores', icon: Users, visible: true },
    { path: '/doormen', label: 'Porteiros', icon: Shield, visible: canAccessDoormen },
  ];

  const navigationItems = allNavigationItems.filter((item) => item.visible);

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo e informações do condomínio */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {title || "Encomendas"}
              </h1>
              {condominium && (
                <p className="text-sm text-gray-600">{condominium.name}</p>
              )}
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold text-gray-900">
                {title || "Encomendas"}
              </h1>
            </div>
          </div>

          {/* Barra de busca - Desktop */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>
          )}

          {/* Botões de ação - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {onAddPackage && (
              <Button 
                onClick={onAddPackage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            )}
            
            {/* Menu do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Porteiro'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menu mobile - botão */}
          <div className="md:hidden flex items-center space-x-2">
            {onAddPackage && (
              <Button 
                onClick={onAddPackage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Barra de busca - Mobile */}
        {onSearchChange && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        )}
      </div>

      {/* Menu mobile - conteúdo */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* Informações do usuário */}
            <div className="pb-3 border-b border-gray-200">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Porteiro'}</p>
              {condominium && (
                <p className="text-sm text-blue-600 mt-1">{condominium.name}</p>
              )}
            </div>

            {/* Navegação */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navegação Desktop */}
      <div className="hidden md:block border-t border-gray-200">
        <nav className="px-6">
          <div className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    isActivePath(item.path)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
