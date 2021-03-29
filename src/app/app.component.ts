import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AuthenticationService} from './_services';
import {AuthModel} from '@app/_models/auth';
import {Title} from '@angular/platform-browser';
import {EmbyComponentIcons} from '@app/emby';

@Component({selector: 'app', templateUrl: 'app.component.html'})

export class AppComponent implements OnInit {
    @ViewChild('mediaDropdownToggle', {read: ElementRef}) mediaDropdownToggle: ElementRef;
    public currentUser: AuthModel;
    public fa = new EmbyComponentIcons().getIcons();
    public navContainerShow = -1;
    public pageTitle = '';
    public mediaTitle = 'Media';
    public pageTitlePrefix = 'Emby :: ';

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        public titleService: Title,
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    ngOnInit(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const conf = this.router.config.find(c => '/' + c.path === event.urlAfterRedirects);
                if (!conf){
                    return;
                }

                this.setPageTitle(conf.data.title);
            }
        });
    }


    logout(): void {
        this.authenticationService.logout();
        this.router.navigate(['/login']).catch(console.error);
    }

    toggleNavigation(value: number, $event?: MouseEvent): void {
        if ($event && $event.target && this.mediaDropdownToggle && $event.target === this.mediaDropdownToggle.nativeElement){
            return;
        }
        this.navContainerShow = value;
    }

    public setPageTitle(title: string): void{
        this.pageTitle = title;
        this.titleService.setTitle(this.pageTitlePrefix + this.pageTitle);
    }
}
