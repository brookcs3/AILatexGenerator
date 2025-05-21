import express from 'express';
import path from 'path';

export function setupPugRoutes(app: express.Express) {
  // Set up Pug as the view engine
  app.set('views', path.join(process.cwd(), 'views'));
  app.set('view engine', 'pug');

  // Define template render function to keep DRY
  const renderPugApp = (req: express.Request, res: express.Response) => {
    res.render('app_pug', {
      title: 'AI LaTeX Generator - Pug Version',
      userCredits: 3
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