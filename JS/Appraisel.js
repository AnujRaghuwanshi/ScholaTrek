document.addEventListener("DOMContentLoaded", function (e) {
    document.getElementById("course-body-button").addEventListener("click", function(event){
      event.preventDefault();

    const tbody = document.getElementById("course-body");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
       <td><input type="text" placeholder="Course name"></td>
                                <td><input type="text" placeholder="Semester"></td>
                                <td><input type="number" placeholder="Size"></td>
                                <td>
                                    <select>
                                        <option value="">Select Mode</option>
                                        <option value="offline">Offline</option>
                                        <option value="online">Online</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </td>
    `;
    tbody.appendChild(newRow);
  });
  });

document.addEventListener("DOMContentLoaded",function(e){
    document.getElementById("research-body-button").addEventListener("click",function(event){
        event.preventDefault();

    const tbody = document.getElementById("research-body");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
     <td><input type="text" placeholder="Publication title"></td>
                                <td><input type="text" placeholder="Journal name"></td>
                                <td>
                                    <select>
                                        <option value="">Select</option>
                                        <option value="sci">SCI</option>
                                        <option value="scopus">Scopus</option>
                                        <option value="ugc">UGC-listed</option>
                                        <option value="other">Other</option>
                                    </select>
                                </td>
                                <td><input type="text" placeholder="DOI"></td>
                                <td><input type="number" placeholder="Year" min="1900" max="2100"></td>
    `;
    tbody.appendChild(newRow);
    });
});

document.addEventListener("DOMContentLoaded",function(e){
    document.getElementById("patent-filled-button").addEventListener("click",function(event){
        event.preventDefault();
    const tbody = document.getElementById("patent-filled");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
       <td><input type="text" placeholder="Patent title"></td>
                                <td><input type="text" placeholder="Patent number"></td>
                                <td>
                                    <select>
                                        <option value="">Select</option>
                                        <option value="filed">Filed</option>
                                        <option value="granted">Granted</option>
                                    </select>
                                </td>
                                <td><input type="number" placeholder="Year"></td>
    `;
    tbody.appendChild(newRow);
});
});


document.addEventListener("DOMContentLoaded",function(e){
    document.getElementById("research-grant-button").addEventListener("click",function(event){
        event.preventDefault();
    const tbody = document.getElementById("research-grant");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
       <td><input type="text" placeholder="Grant title"></td>
        <td><input type="text" placeholder="Funding agency"></td>
        <td><input type="text" placeholder="Duration"></td>
        <td><input type="number" placeholder="Amount"></td>
    `;
    tbody.appendChild(newRow);
});
});

document.addEventListener("DOMContentLoaded",function(e){
    document.getElementById("event-button").addEventListener("click",function(event){
        event.preventDefault();
    const tbody = document.getElementById("event");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
     <td><input type="text" placeholder="Event title"></td>
      <td>
        <select>
            <option value="">Select</option>
            <option value="attendee">Attendee</option>
            <option value="speaker">Speaker</option>
            <option value="organizer">Organizer</option>
        </select>
        </td>
        <td><input type="date"></td>
        <td><input type="text" placeholder="Venue"></td>
    `;
    tbody.appendChild(newRow);
});
});

document.addEventListener("DOMContentLoaded",function(e){
    document.getElementById("awards-button").addEventListener("click",function(event){
        event.preventDefault();
    const tbody = document.getElementById("awards");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
     <td><input type="text" placeholder="Award title"></td>
     <td><input type="text" placeholder="Awarding body"></td>
     <td><input type="number" placeholder="Year"></td>
    `;
    tbody.appendChild(newRow);
});
});

