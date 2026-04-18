import { NextRequest, NextResponse } from 'next/server';

type DashboardRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(request: NextRequest, context: DashboardRouteContext) {
  const apiUrl = process.env.API_URL;
  const token = request.cookies.get('token')?.value;

  if (!apiUrl) {
    return NextResponse.json(
      { status: 'error', message: 'API_URL nao configurada.' },
      { status: 500 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { status: 'error', message: 'Sessao expirada. Faca login novamente.' },
      { status: 401 }
    );
  }

  const { path = [] } = await context.params;
  const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  const dashboardPath = path.map(encodeURIComponent).join('/');
  const backendUrl = new URL(`api/dashboard/${dashboardPath}`, baseUrl);

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const body = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Erro ao conectar com o backend.' },
      { status: 502 }
    );
  }
}
