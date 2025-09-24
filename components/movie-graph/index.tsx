"use client";

import { type Actor } from "@/types/tmdb";
import cytoscape from "cytoscape";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useTheme } from 'next-themes'

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
    const { resolvedTheme } = useTheme()

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
      padding: 30,
      spacingFactor: 1.5,
      avoidOverlap: true,
      animate: true,
      animationDuration: 500,
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
          width: 100,
          height: 100,
          label: "data(label)",
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": 8,
          "background-color": "var(--card)",
          "border-color": "var(--border)",
          color: "var(--foreground)",
          "font-family": "var(--font-sans)",
          "background-fit": "cover",
          "border-width": 2,
          "border-opacity": 1,
        },
      },
      {
        selector: 'node[type="actor"]',
        style: {
          "background-image": "data(image)",
          shape: "round-rectangle",
        },
      },
      {
        selector: 'node[type="movie"]',
        style: {
          "background-image": "data(image)",
          shape: "rectangle",
        },
      },
      {
        selector: "edge",
        style: {
          width: 4,
          "line-color": "var(--primary)",
          "target-arrow-color": "var(--primary)",
          "curve-style": "bezier",
        },
      },
      {
        selector: ".highlighted",
        style: {
          "border-color": "var(--ring)",
          "border-width": 4,
          "line-color": "var(--ring)",
          "target-arrow-color": "var(--ring)",
          "transition-property":
            "border-color, line-color, target-arrow-color",
          "transition-duration": "0.5s",
        },
      },
    ];

    useEffect(() => {
      if (cyRef.current) {
        const root = document.documentElement
        const styles = getComputedStyle(root)

        const newStyles = [
          {
            selector: 'node',
            style: {
              'background-color': styles.getPropertyValue('--card').trim(),
              'border-color': styles.getPropertyValue('--border').trim(),
              color: styles.getPropertyValue('--foreground').trim(),
              'font-family': styles.getPropertyValue('--font-sans').trim(),
            },
          },
          {
            selector: 'edge',
            style: {
              'line-color': styles.getPropertyValue('--primary').trim(),
              'target-arrow-color': styles.getPropertyValue('--primary').trim(),
            },
          },
          {
            selector: '.highlighted',
            style: {
              'border-color': styles.getPropertyValue('--ring').trim(),
              'line-color': styles.getPropertyValue('--ring').trim(),
              'target-arrow-color': styles.getPropertyValue('--ring').trim(),
            },
          },
        ]

        cyRef.current.style(newStyles)
      }
    }, [resolvedTheme])

    return (
      <div className="h-full w-full rounded-xl border bg-card">
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements(initialElements)}
          style={{ width: "100%", height: "100%" }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => {
            cyRef.current = cy;
          }}
        />
      </div>
    );
  },
);

MovieGraph.displayName = "MovieGraph";
