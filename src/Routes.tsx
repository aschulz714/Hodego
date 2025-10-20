import React from 'react';
import { Routes as ReactRoutes, Route } from 'react-router-dom';
import viewsRoutes from 'views/routes';
import ProtectedRoute from './ProtectedRoute';
import Auth0LoginView from '../src/views/Auth0Login';
const Routes = (): JSX.Element => {
  return (
    <ReactRoutes>
      {/* {viewsRoutes.map((item, i) => (
        <Route key={i} path={item.path} element={item.renderer()} />
      ))} */}
      {viewsRoutes.map((route, index) => {
        if (route.protected) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<ProtectedRoute component={route.renderer} />}
            />
          );
        }
        return (
          <Route
            key={index}
            path={route.path}
            element={route.renderer({})}
          />
        );
      })}
      <Route path="/login" element={<Auth0LoginView />} />
      {/* {blocksRoutes.map((item, i) => (
        <Route key={i} path={item.path} element={item.renderer()} />
      ))} */}
      {/* {demosRoutes.map((item, i) => (
        <Route key={i} path={item.path} element={item.renderer()} />
      ))} */}
      {/* <Route path="*" element={<Navigate replace to="/not-found-cover" />} /> */}
    </ReactRoutes>
  );
};

export default Routes;
