import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { injectable, inject } from 'tsyringe';
import { createAppError } from '../../../../middleware/errorMiddleware';
import { SelectionFacade } from '../../domain/SelectionFacade';

@injectable()
export class SelectionRestController {
  constructor(
    @inject('SelectionFacade') private readonly selectionFacade: SelectionFacade,
  ) {}

  toggleBlocked = asyncHandler(async (req: Request, res: Response) => {
    const { selectionId } = req.params;
    const { blocked } = req.body;

    if (!selectionId) {
      throw createAppError(400, 'Selection ID is required');
    }

    if (typeof blocked !== 'boolean') {
      throw createAppError(400, 'blocked must be a boolean value');
    }

    // Verify that the selection exists
    const selection = await this.selectionFacade.getSelectionById(selectionId);
    if (!selection) {
      throw createAppError(404, 'Selection not found');
    }

    try {
      await this.selectionFacade.updateBlocked(selectionId, blocked);

      res.json({
        success: true,
        message: `Selection ${blocked ? 'blocked' : 'unblocked'} successfully`,
        blocked: blocked
      });
    } catch (error) {
      console.error('Error updating selection blocked status:', error);
      throw createAppError(500, 'Failed to update selection blocked status');
    }
  });
}