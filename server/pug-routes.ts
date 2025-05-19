import express from 'express';
import path from 'path';

export function setupPugRoutes(app: express.Express) {
  // Set up Pug as the view engine
  app.set('views', path.join(process.cwd(), 'views'));
  app.set('view engine', 'pug');

  // Route for our Pug test page
  app.get('/pug_test', (req, res) => {
    res.render('app_pug', {
      title: 'AI LaTeX Generator - Pug Version',
      userCredits: 3
    });
  });
}