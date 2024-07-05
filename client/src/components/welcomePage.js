export default function PageHeaderTop(props) {


    return (
        <div>
            <div className="header">
                <span className="filler">
                    <h1 className="title">Fake Stack Overflow</h1>
                </span>
            </div>
            <Options setStart={props.setStart} />
        </div>

    );

}

export function Options(props) {
    return (
        <div className="welcome-page">
            <button id="register" onClick={() => { props.setStart(1) }} className="text-normal-weight main-content-header-items main-content-askQuestion options">
                Register New User
            </button>
            <button id="signInOld" onClick={() => { props.setStart(2) }} className="text-normal-weight main-content-header-items main-content-askQuestion options">
                Sign In Existing User
            </button>
            <button id="signInGuest" onClick={() => { props.setStart(3) }} className="text-normal-weight main-content-header-items main-content-askQuestion options">
                Sign In Guest User
            </button>
        </div>
    )
}