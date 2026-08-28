import { NextResponse, type NextRequest } from 'next/server';

/**
 * Hostname routing and the dashboard's front door.
 *
 * `admin.` on the host serves the dashboard, mirroring how the backend splits
 * its own hostnames. The dashboard is also reachable at /admin on the main host
 * for local work, where subdomains are a nuisance.
 *
 * The signed-in check here is a redirect, not a security boundary: it saves an
 * unauthenticated visitor a wasted page load. The session cookie is httpOnly,
 * every page re-reads it server-side, and the backend re-checks the token and
 * the person's role on every request.
 */

const SESSION_COOKIE = 'jdiobe_admin_token';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const isAdminHost = host.startsWith('admin.');

  // On the admin subdomain, / is the dashboard.
  if (isAdminHost && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
    const rewritten = url.clone();
    rewritten.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  const path = isAdminHost ? `/admin${url.pathname === '/' ? '' : url.pathname}` : url.pathname;

  if (path.startsWith('/admin')) {
    const signedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    const onLoginPage = path === '/admin/login';

    if (!signedIn && !onLoginPage) {
      const login = url.clone();
      login.pathname = isAdminHost ? '/login' : '/admin/login';
      login.searchParams.set('next', url.pathname);
      return NextResponse.redirect(login);
    }
    if (signedIn && onLoginPage) {
      const home = url.clone();
      home.pathname = isAdminHost ? '/' : '/admin';
      home.search = '';
      return NextResponse.redirect(home);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the public API routes.
  matcher: ['/((?!_next/static|_next/image|favicon|images|icons|fonts|api/).*)'],
};
