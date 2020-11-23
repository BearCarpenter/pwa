import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'my-app';
  promptEvent: any;

  constructor(private swUpdate: SwUpdate) {

  }

  ngOnInit(): void {
    // prevent ask install pwa app
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
    });

    // after installation you can handle install app window and emit it. require manifest in index.html
    window.addEventListener('beforeinstallprompt', (e) => {
      // Stash the event so it can be triggered later.
      this.promptEvent = e;
    });

    // prevent show install btn or remove manifest from index.html
    window.addEventListener("load", () => {
      if (navigator.userAgent.indexOf('Mobile') === -1) {
        document.querySelector('link[rel="manifest"]').remove();
      }
    });

    // ask of update version
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("New version available. Load New Version?")) {

          if('caches' in window) {
            if (confirm("Remove all cache?")) {
              caches.keys().then((keyList) => {
                return Promise.all(keyList.map((key) => {
                  return caches.delete(key);
                }));
              });
            }
          }

          window.location.reload();
        }
      });

      // when all users has service worker deleted then you can remove all files with service worker
      if (confirm("remove service worker?")) {
        if (window.navigator && navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations()
          .then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
        }
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceWorker.js')
          .then(success => {
             // The registration was successful
          })
          .catch(err => {
             // The registration failed
          });
      }

      //
      window.addEventListener('install', (event: any) => {
        event.waitUntil(caches.open('my-app')
            .then((cache) => { return cache.addAll(['aaa']); }));
      });

      window.addEventListener('fetch', (event: any) => {
        event.respondWith(caches.match(event.request));
        // If the requested data isn't in the cache, the response
        // will look like a connection error
      });

      window.addEventListener('fetch', (event: any) => {

        event.respondWith(async () => {
          const cache = await caches.open('cache-v1');
          const cachedResponse = await cache.match(event.request);
          const fetchPromise = fetch(event.request);
          let networkResponse: Response;

          event.waitUntil(async () => {
              networkResponse = await fetchPromise;
              // Update the cache with a newer version
              await cache.put(event.request, networkResponse.clone());
          });

          // The response contains cached data, if available
          return cachedResponse || networkResponse;
        });
      });

      navigator.storage.estimate().then((info) => {
          console.log(info.quota / 1000000 + ' MB');
          // It gives us the quota in bytes

          console.log(info.usage / 1000000 + ' MB');
          // It gives us the used data in bytes
      });
    }
  }

  installPwa(): void {
    this.promptEvent.prompt();
  }
}
