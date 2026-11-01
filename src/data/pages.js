import clipsLogo from '../assets/logos/clips-logo.png';
import collabsLogo from '../assets/logos/collabs-logo.png';
import historyLogo from '../assets/logos/history-logo.png';
import instantReactionsLogo from '../assets/logos/instant-reactions-logo.png';
import learnLogo from '../assets/logos/learn-logo.png';
import liveLogo from '../assets/logos/live-logo.png';
import logo from '../assets/logos/logo.png';
import predictionsLogo from '../assets/logos/predictions-logo.png';

const description = 'Pratyush and Aniket bring the F1 circus to your screen!';

export const pages = [
    {
        slug: undefined,
        title: 'Pod on the Apex',
        description,
        metaDescription: 'Pod on the Apex is a Formula 1 podcast from Pratyush and Aniket, with race previews, reviews and predictions throughout the season.',
        logo,
        category: 'podcast',
        itemsPerPage: 6,
        heroPadding: 'py-5',
        seasonTabs: true
    },
    {
        slug: 'shorts',
        title: 'Shorts | Pod on the Apex',
        description,
        metaDescription: 'Quick Formula 1 moments and takes from Pod on the Apex, in under a minute.',
        logo,
        category: 'short',
        itemsPerPage: 12,
        isShort: true
    },
    {
        slug: 'predictions',
        title: 'Predictions on the Apex',
        description,
        metaDescription: 'Pratyush and Aniket make their Formula 1 race predictions ahead of grand prix weekends on Pod on the Apex.',
        logo: predictionsLogo,
        category: 'prediction',
        itemsPerPage: 6
    },
    {
        slug: 'learn',
        title: 'Learn on the Apex',
        description,
        metaDescription: 'New to Formula 1? Short explainers from Pod on the Apex on how the sport works, from flags to the rules.',
        logo: learnLogo,
        category: 'learn',
        itemsPerPage: 6
    },
    {
        slug: 'history',
        title: 'History on the Apex',
        description,
        metaDescription: 'Moments from Formula 1 history, told in short videos by Pod on the Apex.',
        logo: historyLogo,
        category: 'history',
        itemsPerPage: 12,
        isShort: true
    },
    {
        slug: 'instant-reactions',
        title: 'Instant Reactions on the Apex',
        description,
        metaDescription: 'Pratyush and Aniket react to Formula 1 race weekends as they happen, in short videos from Pod on the Apex.',
        logo: instantReactionsLogo,
        category: 'instant-reaction',
        itemsPerPage: 12,
        isShort: true
    },
    {
        slug: 'clips',
        title: 'Clips on the Apex',
        description,
        metaDescription: 'The best moments from Pod on the Apex episodes, in short Formula 1 clips.',
        logo: clipsLogo,
        category: 'clip',
        itemsPerPage: 6
    },
    {
        slug: 'collabs',
        title: 'Collabs on the Apex',
        description,
        metaDescription: 'Pod on the Apex teams up with other Formula 1 creators and podcasts.',
        logo: collabsLogo,
        category: 'collab',
        itemsPerPage: 6
    },
    {
        slug: 'live',
        title: 'Live on the Apex',
        description,
        metaDescription: 'Catch up on Pod on the Apex live streams about Formula 1.',
        logo: liveLogo,
        category: 'live',
        itemsPerPage: 6
    }
];
