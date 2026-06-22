import Router from "./route/Index";
import React from "react";

import ThemeProvider from "./layout/provider/Theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const App = () => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              success: {
                iconTheme: {
                  primary: "#1ee0ac",
                },
              },
            }}
          />
          {/* <React.Suspense fallback={<div>Loading...</div>}> */}
          <Router />
          {/* </React.Suspense> */}
        </ThemeProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
};
export default App;
