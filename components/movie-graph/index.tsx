"use client";

import type cytoscape from "cytoscape";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import type { Actor } from "@/types/tmdb";

interface MovieGraphProps {
  actor1: Actor;
  actor2: Actor;
  onPathFound: (path: string[]) => void;
}

export interface MovieGraphRef {
  addElements: (elements: cytoscape.ElementDefinition[]) => void;
}

export const MovieGraph = forwardRef<MovieGraphRef, MovieGraphProps>(
  ({ actor1, actor2, onPathFound }, ref) => {
    const cyRef = useRef<cytoscape.Core | null>(null);

    const initialElements = [
      {
        data: {
          id: actor1.id.toString(),
          label: actor1.name,
          type: "actor",
          image: actor1.profile_path
            ? `https://image.tmdb.org/t/p/w200${actor1.profile_path}`
            : undefined,
        },
      },
      {
        data: {
          id: actor2.id.toString(),
          label: actor2.name,
          type: "actor",
          image: actor2.profile_path
            ? `https://image.tmdb.org/t/p/w200${actor2.profile_path}`
            : undefined,
        },
      },
    ];

    const findPath = useCallback(() => {
      if (!cyRef.current) return;

      const cy = cyRef.current;
      const dijkstra = cy.elements().dijkstra({
        root: `#${actor1.id}`,
      });
      const pathToActor2 = dijkstra.pathTo(cy.$(`#${actor2.id}`));

      cy.elements().removeClass("highlighted");

      if (pathToActor2) {
        pathToActor2.addClass("highlighted");
        const pathIds = pathToActor2.map((el) => el.id());
        onPathFound(pathIds);
      } else {
        onPathFound([]);
      }
    }, [actor1, actor2, onPathFound]);

    const layout = {
      name: "breadthfirst",
      fit: true,
      padding: 100,
      spacingFactor: 2,
      nodeSeparation: 100,
      avoidOverlap: true,
      animate: true,
      animationDuration: 500,
      animationEasing: "ease-out",
    };

    useImperativeHandle(ref, () => ({
      addElements: (elementsToAdd) => {
        if (cyRef.current) {
          cyRef.current.add(elementsToAdd);
          cyRef.current.layout(layout).run();
          findPath();
        }
      },
    }));

    const stylesheet = [
      {
        selector: "node",
        style: {
          width: 120,
          height: 180,
          label: "data(label)",
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": 12,
          "font-family": "Geist",
          "font-size": 14,
          "font-weight": 400,
          "text-wrap": "wrap",
          "text-max-width": "180px",
          color: "hsl(var(--foreground))",
          "background-color": "hsl(var(--card))",
          "background-fit": "cover",
          "background-clip": "none",
          "box-shadow": "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
      },
      {
        selector: 'node[type="actor"]',
        style: {
          "background-image": "data(image)",
          shape: "round-rectangle",
          "background-color": "hsl(var(--primary) / 0.1)",
        },
      },
      {
        selector: 'node[type="movie"]',
        style: {
          "background-image": "data(image)",
          shape: "round-rectangle",
          "background-color": "hsl(var(--secondary) / 0.1)",
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "hsl(var(--primary) / 1.0)",
          "curve-style": "straight",
          "line-cap": "round",
          opacity: 1.0,
        },
      },
      {
        selector: ".highlighted",
        style: {
          "box-shadow": "0 0 0 3px hsl(var(--primary)), 0 15px 35px -5px rgba(0, 0, 0, 0.2)",
          "line-color": "hsl(var(--primary))",
          opacity: 1,
          "transition-property": "box-shadow, line-color, opacity",
          "transition-duration": "0.3s",
          "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
      {
        selector: "node:hover",
        style: {
          "box-shadow": "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 15px -8px rgba(0, 0, 0, 0.1)",
          "transition-property": "box-shadow",
          "transition-duration": "0.2s",
          "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
      {
        selector: "edge:hover",
        style: {
          width: 4,
          opacity: 1,
          "line-color": "hsl(var(--primary))",
          "transition-property": "width, opacity, line-color",
          "transition-duration": "0.2s",
        },
      },
    ];

    return (
      <div className="h-full w-full relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none graph-grid-pattern" />
        
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements(initialElements)}
          style={{ width: "100%", height: "100%" }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => {
            cyRef.current = cy;
            
            // Add smooth zoom and pan interactions
            cy.userZoomingEnabled(true);
            cy.userPanningEnabled(true);
            cy.boxSelectionEnabled(false);
            
            // Set zoom limits for better UX
            cy.minZoom(0.3);
            cy.maxZoom(2);
          }}
        />
      </div>
    );
  },
);

MovieGraph.displayName = "MovieGraph";
