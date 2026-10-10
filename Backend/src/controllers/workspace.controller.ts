import {Request,Response} from "express";

import {TenantModel} from "../models/tenant.model.js";

export const getCurrentWorkspace = async(
    request:Request,
    response:Response,
): Promise<void> =>{
    if(!request.auth){
        response.status(401).json({
            success:false,
            message:"Authentication Required"
        });

        return;
    }
     try{
      const workspace = await TenantModel.findById(
        request.auth.tenantId,
      ).select("name slug createdAt");

      if(!workspace){
        response.status(404).json({
            success:false,
            message:"Workspace not found",
        });
        return
      }
      response.status(200).json({
        success:true,
        data:{
            id:workspace._id.toString(),
            name:workspace.name,
            slug:workspace.slug,
            role: "role" in request.auth ? request.auth.role : null,
            createdAt:workspace.createdAt
        }
      });
     }catch(error){
        console.log("Failed to get workspace",error);

        response.status(500).json({
          sucess:false,
          message:"Unable to retrieve workspace",
        });
     }
};

export const updateWorkspace = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication Required",
    });

    return;
  }

  const { name, slug } = request.body;

  if (!name && !slug) {
    response.status(400).json({
      success: false,
      message: "At least one field is required",
    });

    return;
  }

  try {
    const workspace = await TenantModel.findByIdAndUpdate(
      request.auth.tenantId,
      {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name slug createdAt");

    if (!workspace) {
      response.status(404).json({
        success: false,
        message: "Workspace not found",
      });

      return;
    }

    response.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to update workspace:", error);

    response.status(500).json({
      success: false,
      message: "Unable to update workspace",
    });
  }
};