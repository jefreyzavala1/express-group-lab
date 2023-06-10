const React = require('react')

function Show(props){
    return (
        <div>
            <h2>Users in the database:</h2>
            <ul>
                {
                    props.users.map(user =>{
                        return (<li key ={user.id}>{user.name} {user.email}</li>)
                    })
                }
            </ul>
        </div>
    )
}

module.exports = Show