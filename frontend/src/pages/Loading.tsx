// import styles from '../styles/loading.module.css';

function Loading() {
    return (
        <div className="flex justify-center items-center h-full bg-main-bg">
            <div className="w-24 h-24 border-12 border-maize border-t-12 border-t-main-bg rounded-[50%] animate-spin"></div>
        </div>
    );
}

export default Loading;