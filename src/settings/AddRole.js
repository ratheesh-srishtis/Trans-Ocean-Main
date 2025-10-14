import React, { useState, useEffect } from "react";
import "../css/settings.css";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  getAllPermissions,
  saveUserRole,
  editUserRole,
} from "../services/apiSettings";
import { getAllDesignations } from "../services/apiEmployee";
import PopUp from "../pages/PopUp";
const AddRole = ({
  open,
  onAddRole,
  onClose,
  editMode,
  roleSet,
  errors,
  setErrors,
}) => {
  const [PermissionList, setPermissionList] = useState([]);
  const [FunctioanlityPermissionList, setFunctioanlityPermissionList] =
    useState([]);
  const [formData, setFormData] = useState({
    role: "",
    designation: "",
    permissions: [],
  });
  const settingsMenuId = "673b9eda3b3ccd845056c370";

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [Designations, setDesiginations] = useState([]);
  useEffect(() => {
    fetchAllPermissions();
    fetchAllDesignations();
  }, []);

  useEffect(() => {
    if (editMode && roleSet) {
      setFormData({
        role: roleSet.roleType.toLowerCase(),
        designation: roleSet.role._id,
        permissions: roleSet.permissions || [],
        roleId: roleSet._id,
      });
    } else {
      setFormData({
        role: "",
        designation: "",
        permissions: [],
      });
    }
  }, [editMode, roleSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        role: "",
        designation: "",
        permissions: [],
      });
    }
  }, [open, setErrors]);
  const fetchAllDesignations = async () => {
    const listDesiginations = await getAllDesignations();
    //console.log(listDesiginations,"---listDesiginations");
    setDesiginations(listDesiginations?.designations || []);
  };
  const [submenus, setSubmenus] = useState([]);

  const fetchAllPermissions = async () => {
    try {
      const listallpermisssions = await getAllPermissions();
      console.log(listallpermisssions, "listallpermisssions");

      if (listallpermisssions?.submenuPermissions) {
        // Flatten all submenu arrays from each menu
        const allSubmenus = listallpermisssions.submenuPermissions.flatMap(
          (item) => item.submenus
        );
        setSubmenus(allSubmenus);
      }
      setPermissionList(listallpermisssions?.permissions || []);
      setFunctioanlityPermissionList(
        listallpermisssions?.functionalityPermissions || []
      );
    } catch (error) {
      console.error("Failed to fetch permissions", error);
    }
  };

  useEffect(() => {
    console.log(submenus, "submenus");
  }, [submenus]);
  const fetchrolesList = async () => {
    setOpenPopUp(false);
    onAddRole();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    if (name === "role" && value) {
      setErrors((prevErrors) => ({ ...prevErrors, roleType: "" }));
    }
  };

  // const handleCheckboxChange = (id) => (event) => {
  //   const { checked } = event.target;
  //   setFormData((prevData) => {
  //     const newPermissions = checked
  //       ? [...prevData.permissions, id]
  //       : prevData.permissions.filter((permId) => permId !== id);

  //     return { ...prevData, permissions: newPermissions };
  //   });
  //   // Clear the permissions error when at least one permission is selected
  //   if (!formData.permissions.includes(id) || checked) {
  //     setErrors((prevErrors) => ({ ...prevErrors, permissions: "" }));
  //   }
  // };

  const handleCheckboxChange = (id) => (event) => {
    const { checked } = event.target;

    setFormData((prevData) => {
      let newPermissions = [];

      if (checked) {
        newPermissions = [...prevData.permissions, id];
      } else {
        newPermissions = prevData.permissions.filter((permId) => permId !== id);

        // If settings is being unchecked, remove its submenus too
        if (id === settingsMenuId) {
          const submenuIds = submenus
            .filter((sm) => sm.menuId === settingsMenuId)
            .map((sm) => sm._id);
          newPermissions = newPermissions.filter(
            (permId) => !submenuIds.includes(permId)
          );
        }
      }

      return { ...prevData, permissions: newPermissions };
    });

    if (!formData.permissions.includes(id) || checked) {
      setErrors((prevErrors) => ({ ...prevErrors, permissions: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.role) newErrors.roleType = "Role Type is required";
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (formData.permissions.length === 0)
      newErrors.permissions = "At least one permission must be selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (editMode) {
        //console.log("Edit mode formData:", formData);
        response = await editUserRole(formData);
      } else {
        // Add new role
        //console.log("Add mode formData:", formData);
        response = await saveUserRole(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ role: "", designation: "", permissions: [] });
      onAddRole(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating role", error);
    }
  };

  useEffect(() => {
    console.log(formData, "formData_addRole");
  }, [formData]);

  return (
    <>
      <Dialog
        sx={{
          width: 800,
          margin: "auto",
          borderRadius: 2,
        }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="lg"
      >
        <div className="d-flex justify-content-between " onClick={onClose}>
          <DialogTitle>{editMode ? "Edit Role" : "Add Role"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="typesofcall-row ">
              <div className="row mb-3 align-items-start">
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Role Type <span className="required"> * </span>:
                  </label>
                  <div className="vessel-select">
                    <select
                      name="role"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.role}
                    >
                      <option value="">Choose Role Type</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    {errors.roleType && (
                      <span className="invalid">{errors.roleType}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-3 align-items-start">
              <div className="col-4">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Role<span className="required"> * </span>:
                </label>
                <select
                  name="designation"
                  className="form-select vesselbox"
                  aria-label="Default select example"
                  onChange={handleChange}
                  value={formData.designation}
                >
                  <option value="">Choose Designation</option>
                  {Designations.map((des) => {
                    return (
                      <option key={des._id} value={des._id}>
                        {des.designationName}
                      </option>
                    );
                  })}
                </select>

                {errors.designation && (
                  <span className="invalid">{errors.designation}</span>
                )}
              </div>
            </div>
            <div className="d-flex addrolepermissions">
              {/* choosesidebarpermissions */}
              <div>
                <div className="choosepermi">Choose Sidebar Permissions</div>
                <div className="permissionlist gap-5">
                  <div>
                    {PermissionList.map((perm) => (
                      <div key={perm._id} className="d-flex mb-2">
                        <input
                          type="checkbox"
                          className="checkboxrole "
                          name="permissions[]"
                          checked={formData.permissions.includes(perm._id)}
                          value={perm._id}
                          onChange={handleCheckboxChange(perm._id)}
                        />
                        <label htmlFor="" className="permissionfont">
                          {" "}
                          {perm.permission.toUpperCase()}
                        </label>
                      </div>
                    ))}

                    {errors.permissions && (
                      <span className="invalid">{errors.permissions}</span>
                    )}
                  </div>
                </div>
              </div>
              {/* choosesubmenupermissions */}

              <div className="settpermission">
                {formData.permissions.includes(settingsMenuId) && (
                  <>
                    <div className="choosepermi">
                      Choose Settings Permissions
                    </div>

                    <div className="submenu-section">
                      {submenus.map((perm) => (
                        <div key={perm._id} className="d-flex mb-2">
                          <input
                            type="checkbox"
                            className="checkboxrole"
                            name="permissions[]"
                            checked={formData.permissions.includes(perm._id)}
                            value={perm._id}
                            onChange={handleCheckboxChange(perm._id)}
                          />
                          <label className="permissionfont">
                            {perm.permission.toUpperCase()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* choosefunctionalitypermissions */}
              <div className="funpermission">
                <div className="choosepermi">
                  Choose Functionality Permissions
                </div>
                <div className="permissionlist gap-5">
                  <div>
                    {FunctioanlityPermissionList.map((permf) => (
                      <div key={permf._id} className="d-flex mb-2">
                        <input
                          type="checkbox"
                          className="checkboxrole"
                          name="permissions[]"
                          checked={formData.permissions.includes(permf._id)}
                          value={permf._id}
                          onChange={handleCheckboxChange(permf._id)}
                        />
                        <label htmlFor="" className="permissionfont">
                          {" "}
                          {permf.permission.toUpperCase()}
                        </label>
                      </div>
                    ))}

                    {errors.permissions && (
                      <span className="invalid">{errors.permissions}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="btnrole">
              <button type="submit" className="btn btna submit-button btnfsize">
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchrolesList} />}
    </>
  );
};

export default AddRole;
