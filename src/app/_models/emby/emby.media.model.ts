import {EmbyLibraryModel} from '@app/_models/emby/emby.library.model';
import {EmbyUserModel} from '@app/_models/emby/emby.user.model';
import {LanguageMap} from '@app/_helpers/language.map';
import {MultiSorter} from '@app/_helpers/multi.sort';
import {ServerService} from '@app/_services/server.service';

interface EmbyUserMetaModel {
    [key: string]: {
        IsFavorite: boolean,
        LastPlayedDate: Date,
        PlayCount: number,
        PlaybackPositionTicks: number,
        Played: boolean,
    }
}

export enum EmbyMediaType {
    Movie = 'Movie',
    Series = 'Series',
    Season = 'Season',
    Episode = 'Episode',
    Folder = 'Folder',
}

interface EmbyUserDataModel {
    IsFavorite: boolean,
    LastPlayedDate: string,
    PlayCount: number,
    PlaybackPositionTicks: number,
    Played: boolean,
}

interface EmbyStreamModel {
    Type: string,
    AspectRatio: string,
    AverageFrameRate: number,
    BitDepth: number,
    BitRate: number,
    ChannelLayout: string,
    Channels: number,
    Codec: string,
    CodecTimeBase: string,
    ColorPrimaries: string,
    ColorSpace: string,
    ColorTransfer: string,
    DisplayLanguage: string,
    DisplayTitle: string,
    Height: number,
    IndexNumber: number,
    IsAVC: boolean,
    IsAnamorphic: boolean,
    IsDefault: boolean,
    IsExternal: boolean,
    IsForced: boolean,
    IsInterlaced: boolean,
    IsTextSubtitleStream: boolean,
    Language: string,
    Level: number,
    NalLengthSize: string,
    PixelFormat: string,
    Profile: string,
    Protocol: string,
    RealFrameRate: number,
    RefFrames: number,
    SupportsExternalStream: boolean,
    TimeBase: string,
    Title: string,
    VideoRange: string,
    Width: number,
    SampleRate: number,
}

export class EmbyMediaModel {

    public Id: string;
    public DateCreated: Date;
    public Episodes: EmbyMediaModel[] = [];
    public MediaSources?: { Size: number }[];
    public MediaStreams?: EmbyStreamModel[];
    public MediaType?: string;
    public Name: string;
    public Genres: string[];
    public LastPlayedDate: Date;
    public Library?: EmbyLibraryModel;
    public LocationType?: string;
    public Overview?: string;
    public ParentId?: string;
    public Path?: string;
    public PlayedPercent: number = 0;
    public IndexNumber: number = 0;
    public ProductionYear: number = 0;
    public CommunityRating: number = 0;
    public Size: number = 0;
    public SortAge: number;
    public SortName: string;
    public SortSize: number = 0;
    public SortPlayedPercent: number = 0;
    public SortPlayedAge: number = 0;
    public SeriesId?: string;
    public SeasonId?: string;
    public SeasonName?: string;
    public SeriesName?: string;
    public Seasons: EmbyMediaModel[] = [];
    public ServerId: string;
    public Selected: boolean = false;
    public Type: (
        EmbyMediaType.Movie | EmbyMediaType.Series | EmbyMediaType.Episode |
        EmbyMediaType.Season | EmbyMediaType.Folder
        );
    public UsersMeta?: EmbyUserMetaModel;
    public UserData?: EmbyUserDataModel;
    public Language?: string[] = [];
    public VideoCodec?: string[] = [];
    public AudioCodec?: string[] = [];
    public Resolution?: { label: string, class: string }[] = [];
    private Cache: { [key: string]: any[] } = {};
    public Collapsed: boolean = true;

    constructor(props) {
        delete props.GenreItems;
        delete props.AirDays;
        props.DateCreated = new Date(props.DateCreated);
        if (props.MediaType === 'Video' && props.MediaSources) {
            props.Size = props.MediaSources.reduce((i, s) => s.Size + i, 0);
        }
        Object.assign(this, props);
        /**
         * SortSize in 5 GB Steps
         */
        this.SortName = this.Name.toLowerCase();
        this.SortSize = Math.round(this.Size / 5368709120);
        this.SortAge = EmbyMediaModel.getSortAge(this.DateCreated);
        //this.analiseMediaStreams();
        this.Library = null;
    }

    public registerSeason(season: EmbyMediaModel) {
        if (this.Type !== EmbyMediaType.Series || this.Id !== season.SeriesId) {
            return this;
        }
        if (!this.Seasons.includes(season)) {
            this.Seasons.push(season);
        }
        return this;
    }

    public hasDeletePermission(): boolean{
        return this.Library && this.Library.CanDelete;
    }

    public registerEpisode(episode: EmbyMediaModel) {
        if (this.Type === EmbyMediaType.Season && this.Id !== episode.SeasonId) {
            return this;
        }
        if (this.Type === EmbyMediaType.Series && this.Id !== episode.SeriesId) {
            return this;
        }
        if (!this.Episodes.includes(episode)) {
            this.Episodes.push(episode);
        }
        return this;
    }

    public registerLibrary(libraries: EmbyLibraryModel[]) {
        const library = libraries.find(lib => lib.Locations.find(p => this.Path.startsWith(p)));
        if (!library) {
            return this;
        }
        if (this.Type === EmbyMediaType.Series) {
            this.Seasons.forEach(s => s.Library = library);
            this.Episodes.forEach(s => s.Library = library);
        }
        this.Library = library;
        this.Library.MediaItems.push(this);
        return this;
    }

    public registerUserItem(user: EmbyUserModel, userMediaItem?: EmbyMediaModel) {
        if (!userMediaItem || !userMediaItem.UserData) {
            return this;
        }
        this.ProductionYear = this.ProductionYear || userMediaItem.ProductionYear;
        this.UsersMeta = this.UsersMeta || {};
        this.UsersMeta[user.Name] = this.UsersMeta[user.Name] || {
            IsFavorite: false,
            LastPlayedDate: new Date(0),
            PlayCount: 0,
            PlaybackPositionTicks: 0,
            Played: false,
        };
        this.UsersMeta[user.Name] = Object.assign(this.UsersMeta[user.Name], userMediaItem.UserData);
        this.UsersMeta[user.Name].LastPlayedDate = new Date(this.UsersMeta[user.Name].LastPlayedDate);
    }

    public calculateUsersMeta(users: EmbyUserModel[]) {
        this.PlayedPercent = 0;
        this.LastPlayedDate = new Date(0);
        let userNames = users.filter(u => u.Selected).map(u => u.Name);
        const calculateMetaData = usersMeta => {
            Object.keys(usersMeta).forEach(uName => {
                if (!userNames.includes(uName)) {
                    return;
                }
                const m = usersMeta[uName] = usersMeta[uName] || {
                    IsFavorite: false,
                    LastPlayedDate: new Date(0),
                    PlayCount: 0,
                    PlaybackPositionTicks: 0,
                    Played: false,
                };
                this.PlayedPercent += m.Played ? 100 : 0;
                this.LastPlayedDate = m.LastPlayedDate > this.LastPlayedDate ? m.LastPlayedDate : this.LastPlayedDate;
            });
        };
        this.UsersMeta = this.UsersMeta || {};
        if (this.Type === EmbyMediaType.Movie) {
            calculateMetaData(this.UsersMeta);
            this.PlayedPercent = Math.round(this.PlayedPercent / userNames.length);
        } else {
            this.Episodes.forEach(episode => {
                episode.UsersMeta = episode.UsersMeta || {};
                calculateMetaData(episode.UsersMeta);
            });
            this.PlayedPercent = Math.round(this.PlayedPercent / (userNames.length * this.Episodes.length));
        }
        this.SortPlayedPercent = Math.round(this.PlayedPercent / 10);
        this.SortPlayedAge = EmbyMediaModel.getSortAge(this.LastPlayedDate);
        return this;
    }

    public calculateSize() {
        if (![EmbyMediaType.Season, EmbyMediaType.Series].includes(this.Type)) {
            return this;
        }
        this.Size = this.Episodes.reduce((i, s) => s.Size + i, 0);
        this.SortSize = Math.round(this.Size / 5368709120);
        return this;
    }

    private static getSortAge(date: Date) {
        const diffS = (new Date().getTime() - date.getTime()) / 1000;
        return Math.round(diffS / 30 / 86400);
    }

    public getResolution(): any[] {
        let resolutions = [...this.Resolution];
        this.Episodes.forEach(e => resolutions.push(...e.Resolution));
        let resByClass = {};
        resolutions.forEach(r => resByClass[r.class] = r);
        return Object.values(resByClass);
    }

    public getAudioCodec(): string[] {
        if (this.Cache.AudioCodec) {
            return this.Cache.AudioCodec;
        }
        let codec = [...this.AudioCodec];
        this.Episodes.forEach(e => codec.push(...e.AudioCodec));
        return this.Cache.AudioCodec = EmbyMediaModel.arrayUnique(codec);
    }

    public getVideoCodec(): string[] {
        if (this.Cache.VideoCodec) {
            return this.Cache.VideoCodec;
        }
        let codec = [...this.VideoCodec];
        this.Episodes.forEach(e => codec.push(...e.VideoCodec));
        return this.Cache.VideoCodec = EmbyMediaModel.arrayUnique(codec);
    }

    public getLanguage(): string[] {
        if (this.Cache.Language) {
            return this.Cache.Language;
        }
        let lang = [...this.Language];
        this.Episodes.forEach(e => lang.push(...e.Language));
        return this.Cache.Language = EmbyMediaModel.arrayUnique(lang);
    }

    public hasVideoCodec(codec) {
        return this.getVideoCodec().includes(codec);
    }

    public hasAudioCodec(codec) {
        return this.getAudioCodec().includes(codec);
    }

    public hasVideoResolution(resolution) {
        return this.getResolution().find(r => r.class === resolution);
    }

    public hasLanguage(lang) {
        return this.getLanguage().includes(lang);
    }

    public getAudioStreams(recursive: boolean = false) {
        return this.getStreamsByType('Audio', recursive);
    }

    public getVideoStreams(recursive: boolean = false) {
        return this.getStreamsByType('Video', recursive);
    }

    private getStreamsByType(type: string, recursive: boolean = true): EmbyStreamModel[] {
        const streams = Array.isArray(this.MediaStreams) ? this.MediaStreams.filter(m => m.Type === type) : [];
        if (recursive) {
            this.getChildren().forEach(c => streams.push(...c.getStreamsByType(type, recursive)));
        }
        return streams;
    }

    private getChildren(): EmbyMediaModel[] {
        if (this.Type === EmbyMediaType.Series) {
            return this.Seasons || [];
        }
        if (this.Type === EmbyMediaType.Season) {
            return this.Episodes || [];
        }
        return [];
    }

    public getSubTileStreams() {
        return Array.isArray(this.MediaStreams) ? this.MediaStreams.filter(m => m.Type === 'Subtitle') : [];
    }

    public getPlayedByUsers(): { User: string, Date: Date }[] {
        if (!this.UsersMeta) {
            return [];
        }
        const played = Object.keys(this.UsersMeta).map(user => {
            return {User: user, Date: this.UsersMeta[user].LastPlayedDate};
        });
        new MultiSorter().sort(played, {Date: -1});
        return played;
    }

    public getPlayedByUsersList(): string[] {
        this.UsersMeta = this.UsersMeta || {};
        const userList = [...Object.keys(this.UsersMeta)];
        if (Array.isArray(this.Episodes)) {
            this.Episodes.forEach(e => userList.push(...e.getPlayedByUsersList()));
        }
        return EmbyMediaModel.arrayUnique(userList);
    }

    public analiseMediaStreams() {
        const videos = this.getVideoStreams(true);
        const audios = this.getAudioStreams(true);
        if (!videos.length) {
            console.warn('Title has no video streams', this.Name, this.Type, this.Path, this.MediaStreams);
            return;
        }
        const languageMap = new LanguageMap();
        this.Resolution.push(...videos.map(video => this.getNormalizedResolution(video)));
        this.VideoCodec.push(...videos.map(video => video.Codec));
        this.AudioCodec.push(...audios.map(audio => audio.Codec));
        this.Language.push(...audios.map(audio => {
            if (typeof audio.Language !== 'string') {
                return 'UND';
            }
            const lang = languageMap.getLanguageByCode(audio.Language);
            if (!lang) {
                return audio.Language.toUpperCase();
            }
            return lang.codes[2].toUpperCase();
        }));
        this.VideoCodec = EmbyMediaModel.arrayUnique(this.VideoCodec);
        this.AudioCodec = EmbyMediaModel.arrayUnique(this.AudioCodec);
        this.Language = EmbyMediaModel.arrayUnique(this.Language);
        if (this.Type === EmbyMediaType.Series && Array.isArray(this.Seasons)) {
            this.Seasons.forEach(s => s.analiseMediaStreams());
        }
        if (this.Type === EmbyMediaType.Season && Array.isArray(this.Episodes)) {
            this.Episodes.forEach(e => e.analiseMediaStreams());
        }
    }

    public getWebUrl(): string {
        return [ServerService.getApiUrl(), '/web/index.html#!/item?id=', this.Id, '&serverId=', this.ServerId].join('');
    }

    private getNormalizedResolution(video: { Height: number, Width: number }) {
        const resolutionMap = [
            {
                label: '2160p',
                class: 'UHD',
                is: (height: number): boolean => height >= 2160,
            },
            {
                label: '1440p',
                class: 'UHD',
                is: (height: number): boolean => height >= 1440,
            },
            {
                label: '1080p',
                class: 'HD',
                is: (height: number): boolean => height >= 1080,
            },
            {
                label: '720p',
                class: 'HDR',
                is: (height: number): boolean => height >= 720,
            },
            {
                label: '480p',
                class: 'SD',
                is: (height: number): boolean => height >= 0,
            },
        ];
        const res = resolutionMap.find(r => r.is(video.Height));
        return {
            label: res.label,
            class: res.class,
            res: [video.Width, 'x', video.Height].join(''),
            height: video.Height,
            width: video.Width
        };
    }

    private static arrayUnique(array: any[]): any[] {
        return array.filter((value, index, self) => self.indexOf(value) === index);
    }
}
