import * as groupRepository from "../repositories/group.repository.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/error.util.js";

export const getGroups = async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  return groupRepository.findByUserId(userId, {
    page,
    limit,
    orderBy: "created_at",
    order: "desc",
  });
};

export const getGroupById = async (userId, groupId) => {
  const group = await groupRepository.findByIdAndUserId(groupId, userId);

  if (!group) {
    throw NotFoundError("Group tidak ditemukan");
  }

  return group;
};

export const createGroup = async (userId, { name }) => {
  if (!name || name.trim() === "") {
    throw BadRequestError("Nama group tidak boleh kosong");
  }

  const exists = await groupRepository.existsByName(name.trim(), userId);
  if (exists) {
    throw ConflictError("Group dengan nama ini sudah ada");
  }

  const group = await groupRepository.create({
    name: name.trim(),
    userId: userId,
  });

  return group;
};

export const updateGroup = async (userId, groupId, { name }) => {
  const group = await groupRepository.findByIdAndUserId(groupId, userId);

  if (!group) {
    throw NotFoundError("Group tidak ditemukan");
  }

  if (name !== undefined && name.trim() === "") {
    throw BadRequestError("Nama group tidak boleh kosong");
  }

  const exists = await groupRepository.existsByName(
    name.trim(),
    userId,
    groupId,
  );
  if (exists) {
    throw ConflictError("Group dengan nama ini sudah ada");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();

  return groupRepository.update(groupId, updateData);
};

export const deleteGroup = async (userId, groupId) => {
  const group = await groupRepository.findByIdAndUserId(groupId, userId);

  if (!group) {
    throw NotFoundError("Group tidak ditemukan");
  }

  await groupRepository.softDelete(groupId);

  return { message: "Group berhasil dihapus" };
};
