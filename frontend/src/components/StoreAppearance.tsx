"use client";
import {useEffect} from 'react';
import {useCatalog} from '@/context/CatalogContext';
export function StoreAppearance(){const {settings}=useCatalog();useEffect(()=>{const a=settings.appearance||{},c=settings.contact||{};
 if(typeof a.primary==='string')document.documentElement.style.setProperty('--store-green',a.primary);
 if(typeof a.accent==='string')document.documentElement.style.setProperty('--store-orange',a.accent);
 if(a.favicon){let link=document.querySelector<HTMLLinkElement>('link[rel="icon"]');if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link);}link.href=String(a.favicon);}
 if(a.logo)document.querySelectorAll<HTMLImageElement>('img[src*="halal-sheba-logo"]').forEach(img=>{img.src=String(a.logo);});
 if(c.phone)document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach(link=>{link.href='tel:'+String(c.phone);});
 if(c.whatsapp)document.querySelectorAll<HTMLAnchorElement>('a[href*="whatsapp.com"],a[href*="wa.me"]').forEach(link=>{const u=new URL(link.href);if(u.hostname==='wa.me')u.pathname='/'+String(c.whatsapp);else u.searchParams.set('phone',String(c.whatsapp));link.href=u.toString();});
},[settings]);const primary=String(settings.appearance?.primary||'');const accent=String(settings.appearance?.accent||'');return <style>{`${/^#[0-9a-f]{6}$/i.test(primary)?`.store-primary-link{background:${primary}!important}.store-hero h1,.store-section-heading h2{color:${primary}!important}`:''}${/^#[0-9a-f]{6}$/i.test(accent)?`.store-slide-dots button .is-active{background:${accent}!important}`:''}`}</style>;}
