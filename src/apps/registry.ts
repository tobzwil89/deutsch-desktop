import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import {
  AboutIcon,
  ArticlesIcon,
  ConjugatorIcon,
  LegalIcon,
  LevelTestIcon,
  ProgressIcon,
  VocabIcon,
} from '../icons/AppIcons'

export type AppId = 'vocab' | 'articles' | 'conjugator' | 'leveltest' | 'about' | 'progress' | 'legal'

export type AppDef = {
  id: AppId
  title: string
  /** Kurzer Name unter Icons (Handy, Desktop) */
  label: string
  Icon: ComponentType<{ size?: number; className?: string }>
  Component: LazyExoticComponent<ComponentType>
  size: { w: number; h: number }
  minSize: { w: number; h: number }
  inDock: boolean
}

// Jede App wird erst beim Öffnen geladen (Lazy Loading)
export const APPS: AppDef[] = [
  {
    id: 'vocab',
    title: 'Vocab Trainer',
    label: 'Vocab',
    Icon: VocabIcon,
    Component: lazy(() => import('./vocab/VocabApp')),
    size: { w: 640, h: 560 },
    minSize: { w: 380, h: 420 },
    inDock: true,
  },
  {
    id: 'articles',
    title: 'Der · Die · Das',
    label: 'Der/Die/Das',
    Icon: ArticlesIcon,
    Component: lazy(() => import('./articles/ArticlesApp')),
    size: { w: 560, h: 560 },
    minSize: { w: 380, h: 440 },
    inDock: true,
  },
  {
    id: 'conjugator',
    title: 'Conjugator',
    label: 'Conjugator',
    Icon: ConjugatorIcon,
    Component: lazy(() => import('./conjugator/ConjugatorApp')),
    size: { w: 600, h: 560 },
    minSize: { w: 380, h: 420 },
    inDock: true,
  },
  {
    id: 'leveltest',
    title: 'Level Test',
    label: 'Level Test',
    Icon: LevelTestIcon,
    Component: lazy(() => import('./leveltest/LevelTestApp')),
    size: { w: 620, h: 600 },
    minSize: { w: 380, h: 440 },
    inDock: true,
  },
  {
    id: 'progress',
    title: 'Progress',
    label: 'Progress',
    Icon: ProgressIcon,
    Component: lazy(() => import('./progress/ProgressApp')),
    size: { w: 680, h: 620 },
    minSize: { w: 380, h: 420 },
    inDock: true,
  },
  {
    id: 'about',
    title: 'About Me',
    label: 'About Me',
    Icon: AboutIcon,
    Component: lazy(() => import('./about/AboutApp')),
    size: { w: 600, h: 620 },
    minSize: { w: 360, h: 400 },
    inDock: true,
  },
  {
    id: 'legal',
    title: 'Legal & Privacy',
    label: 'Legal',
    Icon: LegalIcon,
    Component: lazy(() => import('./legal/LegalApp')),
    size: { w: 520, h: 520 },
    minSize: { w: 340, h: 360 },
    inDock: false,
  },
]

export const APP_BY_ID = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<AppId, AppDef>
