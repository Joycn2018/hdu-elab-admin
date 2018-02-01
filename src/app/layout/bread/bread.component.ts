import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET} from '@angular/router';
import 'rxjs/add/operator/filter';

interface IBreadcrumb {
  label: string;
  params: Params;
  url: string;
}

@Component({
  selector: 'app-bread',
  templateUrl: 'bread.component.html',
  styleUrls: ['./bread.component.less']
})
export class BreadComponent implements OnInit {

  public breadcrumbs: IBreadcrumb[];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      // set breadcrumbs
      const root: ActivatedRoute = this.activatedRoute.root;
      this.breadcrumbs = this.getBreadcrumbs(root);
    });
  }

  private getBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadcrumb[] = []): IBreadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

    // get the child routes
    const children: ActivatedRoute[] = route.children;

    // return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // iterate over each children
    for (const child of children) {
      // verify primary route
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      // verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      // get the route's URL segment
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      // append route URL to URL
      url += `/${routeURL}`;

      // add breadcrumb
      const params = child.snapshot.params;
      const breadcrumb: IBreadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        params: params,
        url: url
      };
      breadcrumbs.push(breadcrumb);

      // recursive
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }
}
