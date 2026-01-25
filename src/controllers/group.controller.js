import * as groupService from "../services/group.service.js";

export const getGroups = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;

    const result = await groupService.getGroups(userId, { page, limit });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const group = await groupService.getGroupById(userId, id);
    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const result = await groupService.createGroup(userId, { name });
    res.status(201).json({
      success: true,
      message: "Group berhasil dibuat",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name } = req.body;

    const group = await groupService.updateGroup(userId, id, { name });
    res.status(200).json({
      success: true,
      message: "Group berhasil diupdate",
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await groupService.deleteGroup(userId, id);
    res.status(200).json({
      success: true,
      message: "Group berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};
