export type TNowPlayingProps = {
    coverImgTag: string;
    title: string;
    artist: string;
    progressWidth: number;
};

type TExternalUrls = {
    spotify: string;
};

type TImages = {
    height: number;
    url: string;
    width: number;
};

export type TArtist = {
    external_urls: TExternalUrls;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
};

export type TAlbum = {
    album_type: string;
    artists: TArtist[];
    avaliable_markets: string[];
    external_urls: TExternalUrls;
    href: string;
    id: string;
    images: TImages[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    url: string;
};

export type TItem = {
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: { isrc: string };
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url?: string;
    track_number: number;
    type: string;
    album: TAlbum;
    artists: TArtist[];
    avaliable_markets: string;
};
