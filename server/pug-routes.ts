import express from 'express';
import path from 'path';

export function setupPugRoutes(app: express.Express) {
  // Set up Pug as the view engine
  app.set('views', path.join(process.cwd(), 'views'));
  app.set('view engine', 'pug');

  // Define template render function to keep DRY
  const renderPugApp = (req: express.Request, res: express.Response) => {
    const siteTitle = process.env.SITE_TITLE || 'AI LaTeX Generator';
    const siteDescription =
      process.env.SITE_DESCRIPTION ||
      'Generate professional LaTeX documents with AI assistance.';
    const siteDomain = process.env.SITE_DOMAIN || 'https://aitexgen.com';
    const siteImage =
      process.env.SITE_IMAGE || `${siteDomain}/logo.png`;

    // Compute canonical URL based on the request path
    const canonicalUrl = `${siteDomain.replace(/\/$/, '')}${req.path}`;

    res.render('app_pug', {
      title: siteTitle,
      description: siteDescription,
      ogUrl: canonicalUrl,
      ogImage: siteImage,
      userCredits: 3,
    });
  };

  // Original route (preserved for backward compatibility)
  app.get('/pug_test', renderPugApp);
  
  // New more intuitive routes
  app.get('/app/pug', renderPugApp);
  app.get('/pug', renderPugApp);
  
  // Route that reflects the "alternative" nature of this implementation
  app.get('/app/alternative', renderPugApp);
}