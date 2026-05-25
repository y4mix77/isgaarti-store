import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { LucideAngularModule, LogIn, Mail, Lock, User, UserPlus, Home, Package, ShoppingCart, UserCircle, Shield, LogOut, ShieldCheck, ShoppingBag, ArchiveX, Minus, Plus, ArrowRight, Check, Contact, Radio, ChevronRight, Layers, Cpu, PenTool, ShieldAlert, Command, Banknote, TrendingUp, BookOpen, Users, BookText, FileSpreadsheet, Search, BookPlus, Library, Tags, UserCheck, AlertTriangle, LayoutDashboard, BarChart3, Wallet, Truck, Clock, Settings, ArrowUpRight, ArrowDownRight, Star, Box, History, Bell, X, RefreshCw, Thermometer, Activity, Zap, ExternalLink, Crown, Trash2, Pencil, ArrowLeft, CheckCircle, AlertCircle, Database, RadioTower, ImagePlus, UploadCloud, Layers3, ChevronDown, Save, PackageOpen, Edit3, Settings2, Trash, Boxes, Network, MailCheck, Route, Building2, Phone, Link, Orbit, TimerReset, Sparkles, Shuffle, PanelLeftOpen, PackageCheck, MousePointerClick, StopCircle, Inbox, Pin, ListChecks, Fingerprint, Crosshair, Target, PowerOff, Workflow, Share2, Link2, Building, CloudCog, Ban, Factory, Hexagon, Maximize, Grid, FolderTree, BoxSelect, Video, Bookmark, FileX2, CircleX, SlidersHorizontal, SearchX, Eye, Gem, Ticket, MapPin, List } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(LucideAngularModule.pick({ 
      LogIn, Mail, Lock, User, UserPlus, Home, Package, ShoppingCart, UserCircle, Shield, LogOut, 
      ShieldCheck, ShoppingBag, ArchiveX, Minus, Plus, ArrowRight, Check, Contact, Radio, 
      ChevronRight, Layers, Cpu, PenTool, ShieldAlert, Command, Banknote, TrendingUp, 
      BookOpen, Users, BookText, FileSpreadsheet, Search, BookPlus, Library, Tags, 
      UserCheck, AlertTriangle, LayoutDashboard, BarChart3, Wallet, Truck, Clock, 
      Settings, ArrowUpRight, ArrowDownRight, Star, Box, History, Bell, X, RefreshCw, 
      Thermometer, Activity, Zap, ExternalLink, Crown, Trash2, Pencil, ArrowLeft, CheckCircle, AlertCircle,
      Database, RadioTower, ImagePlus, UploadCloud, Layers3, ChevronDown, Save, PackageOpen, Edit3, Settings2, Trash, Boxes, Network, MailCheck, Route, Building2, Phone, Link, Orbit, TimerReset, Sparkles, Shuffle, PanelLeftOpen, PackageCheck, MousePointerClick, StopCircle, Inbox, Pin, ListChecks, Fingerprint, Crosshair, Target, PowerOff,
      Workflow, Share2, Link2, Building, CloudCog, Ban, Factory, Hexagon, Maximize, Grid, FolderTree, BoxSelect, Video, Bookmark, FileX2, CircleX, SlidersHorizontal, SearchX, Eye, Gem, Ticket, MapPin, List
    }))
  ]
};
