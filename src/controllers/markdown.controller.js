import * as markdownService from "../services/markdown.service.js";

export const getFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, orderBy, order, search, ungrouped, group_id } = req.query;

    let result;
    if (search) {
      result = await markdownService.searchFiles(userId, search, {
        page,
        limit,
        group_id,
        ungrouped: ungrouped === "true",
      });
    } else {
      result = await markdownService.getFiles(userId, {
        page,
        limit,
        orderBy,
        order,
        ungrouped: ungrouped === "true",
        group_id,
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await markdownService.getFileCount(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const files = await markdownService.getRecentFiles(userId, limit);

    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const file = await markdownService.getFileById(userId, id);

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, group_id } = req.query;

    // req.body adalah raw text (content markdown)
    const content = typeof req.body === "string" ? req.body : undefined;

    const file = await markdownService.updateFile(userId, id, {
      title,
      content,
      group_id,
    });

    res.status(200).json({
      success: true,
      message: "File berhasil diupdate",
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await markdownService.deleteFile(userId, id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ids } = req.body;

    const result = await markdownService.bulkDeleteFiles(userId, ids);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeletedFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;

    const result = await markdownService.getDeletedFiles(userId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeletedFileCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await markdownService.getDeletedFileCount(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const restoreFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const file = await markdownService.restoreFile(userId, id);

    res.status(200).json({
      success: true,
      message: "File berhasil di-restore",
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const restoreAllFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await markdownService.restoreAllFiles(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await markdownService.permanentDeleteFile(userId, id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const emptyTrash = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await markdownService.emptyTrash(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files?title=Judul
 * Create file dengan raw markdown (plain text body)
 *
 * Cara pakai di Postman:
 * - Body type: raw
 * - Format: Text (bukan JSON!)
 * - Query param: ?title=Judul File
 * - Body: langsung paste isi markdown
 */
export const createFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const title = req.query.title || "Untitled";
    const { group_id } = req.query;

    // req.body akan berisi raw text karena express.text()
    const content = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Content tidak boleh kosong. Paste isi markdown di body.",
      });
    }

    const file = await markdownService.createFile(userId, {
      title,
      content,
      group_id,
    });

    res.status(201).json({
      success: true,
      message: "File berhasil dibuat",
      data: file,
    });
  } catch (error) {
    next(error);
  }
};
