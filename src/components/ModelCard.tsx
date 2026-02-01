import * as React from "react";
import type { ZeliModel } from "@/data/models";
import { Carousel } from "./Carousel";
import styles from "./ModelCard.module.css";
import { IconPerson } from "./icons";

export function ModelCard({ model }: { model: ZeliModel }) {
  return (
    <article className={styles.card}>
      <div className={styles.mediaWrap}>
        <Carousel images={model.images} alt={`${model.name} portfolio`} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{model.name}</h3>
        <div className={styles.metaRow}>
          <IconPerson className={styles.metaIcon} />
          <span>{model.height}</span>
        </div>
        <div className={styles.divider} />
        <p className={styles.bio}>{model.bio}</p>
      </div>
    </article>
  );
}

