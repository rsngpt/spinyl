export default function Loading() {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#121212',
            color: '#fff',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <style>
                {`
                    @keyframes spin-record {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes glow-pulse {
                        0% { box-shadow: 0 0 15px rgba(29, 185, 84, 0.3); }
                        50% { box-shadow: 0 0 30px rgba(29, 185, 84, 0.8), 0 0 50px rgba(29, 185, 84, 0.2); }
                        100% { box-shadow: 0 0 15px rgba(29, 185, 84, 0.3); }
                    }

                    .vinyl-record {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: radial-gradient(circle, #1DB954 25%, #181818 26%, #181818 28%, #111 30%, #111 32%, #222 34%, #111 36%, #222 38%, #111 40%, #222 42%, #111 44%, #222 46%, #111 50%, #222 55%, #111 60%, #222 70%, #111 100%);
                        position: relative;
                        animation: spin-record 1.2s linear infinite, glow-pulse 2s ease-in-out infinite;
                        border: 2px solid #222;
                    }

                    .vinyl-label {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 24px;
                        height: 24px;
                        background: #1DB954;
                        border-radius: 50%;
                        border: 2px solid #151515;
                    }
                    
                    .vinyl-hole {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 6px;
                        height: 6px;
                        background: #121212;
                        border-radius: 50%;
                    }
                `}
            </style>

            <div className="vinyl-record">
                <div className="vinyl-label">
                    <div className="vinyl-hole"></div>
                </div>
            </div>
        </div>
    );
}
