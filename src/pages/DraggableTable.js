import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { getPdaInformations, changeServiceOrder } from "../services/apiService";
const DraggableTable = ({}) => {
  const [users, setUsers] = useState([]);

  const fetchPdaDetails = async () => {
    let data = {
      pdaId: "682dbb4132a65dee7d1c464c",
    };
    try {
      const pdaDetails = await getPdaInformations(data);
      console.log("PDADETAILS", pdaDetails);
      setUsers(pdaDetails?.pdaServices);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(users, "users");
  }, [users]);

  useEffect(() => {
    fetchPdaDetails();
  }, []);

  const handleDragEnd = async (e) => {
    if (!e.destination) return;

    const sourceIndex = e.source.index;
    const destIndex = e.destination.index;

    const tempData = Array.from(users);
    const [movedItem] = tempData.splice(sourceIndex, 1);
    tempData.splice(destIndex, 0, movedItem);

    // Update the UI
    setUsers(tempData);

    // Call API only for rows whose order has changed
    const changedItems = tempData.filter(
      (item, index) => users[index]?._id !== item._id
    );

    for (let index = 0; index < changedItems.length; index++) {
      const item = changedItems[index];
      const newIndex = tempData.findIndex((i) => i._id === item._id);

      const payload = {
        pdaChargeId: item._id,
        order: newIndex + 1, // because backend uses 1-based index
      };

      console.log("API_Payload:", payload);

      // Replace with your actual API call
      //   const response = await changeServiceOrder(payload);
      //   console.log(response, "changeServiceOrder");
    }
  };

  return (
    <>
      <div className="App mt-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="table borderd">
            <thead>
              <tr>
                <th className="tableheadcolor" />
                <th className="tableheadcolor">Service Type</th>
                <th className="tableheadcolor">Charge Type</th>
                <th className="tableheadcolor">Sub Charge Type</th>
                <th className="tableheadcolor">Amount (OMR)</th>
                <th className="tableheadcolor">VAT Amount</th>
                <th className="tableheadcolor">Total OMR</th>
                <th className="tableheadcolor">Total USD</th>
                <th className="tableheadcolor">Actions</th>{" "}
              </tr>
            </thead>
            <Droppable droppableId="droppable-1">
              {(provider) => (
                <tbody
                  className="text-capitalize"
                  ref={provider.innerRef}
                  {...provider.droppableProps}
                >
                  {users?.map((user, index) => (
                    <Draggable
                      key={user?._id}
                      draggableId={user?._id}
                      index={index}
                    >
                      {(provider) => (
                        <tr
                          {...provider.draggableProps}
                          ref={provider.innerRef}
                        >
                          <td {...provider.dragHandleProps}> = </td>
                          <td>{user?.serviceId?.serviceName}</td>
                          <td>{user.chargeId?.chargeName}</td>
                          <td>{user.subchargeId?.subchargeName}</td>
                          <td>{user.customerOMR.toFixed(3)}</td>
                          <td>{user.customerVAT.toFixed(3)}</td>
                          <td>
                            {(
                              parseFloat(user.customerOMR) +
                              parseFloat(user.customerVAT)
                            ).toFixed(3)}
                          </td>
                          <td>{user.customerTotalUSD.toFixed(2)}</td>
                          <td>
                            <i className="bi bi-pencil-square editicon"> </i>
                            <i className="bi bi-trash deleteicon"></i>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provider.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    </>
  );
};

export default DraggableTable;
