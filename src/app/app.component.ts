import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';

export interface list {
  listName: string;
  routePath: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  mobileQuery!: MediaQueryList;
  private _mobileQueryListener: () => void;

  public navList: list[] = [{ listName: 'upload', routePath: 'upload' }];

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    setTheme('bs5');
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  public route(path: string) {
    this.router.navigateByUrl(`/${path}`);
  }
}
