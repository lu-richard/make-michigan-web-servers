import styles from '../styles/map.module.css';

function Map() {
    return (
        <div className={styles.container}>
            <div className={styles["top-bar"]}>
                <h1>Real-Time Map of U-M Makerspaces</h1>
                <button type="button" className={styles["reset-button"]}>Reset</button>
                <button type="button" className={styles["tutorial-button"]}>How do you use this map?</button>
            </div>
            <div className={styles["map-container"]}></div>
        </div>
    );
}

export default Map;